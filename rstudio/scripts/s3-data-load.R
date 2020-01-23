options(stringsAsFactors = FALSE)
if(!require(httr)) install.packages("httr") 
if(!require(aws.s3)) install.packages("aws.s3")
if(!require(rpostgis)) install.packages("rpostgis")
if(!require(readr)) install.packages("readr")
if(!require(stringr)) install.packages("stringr")
if(!require(dplyr)) install.packages("dplyr")
if(!require(sf)) install.packages("sf")
if(!require(geojsonsf)) install.packages("geojsonsf")
if(!require(dotenv)) install.packages("dotenv")
if(!require(pacman)) install.packages("pacman"); library(pacman)
p_load(aws.s3, httr, rpostgis, readr, stringr, dplyr, sf, geojsonsf, dotenv)

#################
##ENV SETUP PHASE
#################

##Load env vars
homeDir <- try(system("echo $HOME", intern = TRUE))
##docker specific logic for running docker exec
if(homeDir=="/root") home_dir <- "/home/rstudio"
dotenv::load_dot_env(file = paste0(homeDir, "/pp-pipeline/scripts/rstudio.env"))

#####################
##DATA FETCHING PAHSE
#####################

##AWS S3 DATA########
##Donwload all relevant S3 data to populate DB
##Note if there is a 403 error, you may need to docker-compose up --build
tryCatch({
  ppBucket <- get_bucket("property-praxis")
  ##functionto get file names
  getBucketNames <- function(x){
    return(x[[1]][1])
  }
}, 
##print warning message
warning=function(w){
  print(w)
})
  
##separate file names into different lists
s3FileNames <- lapply(ppBucket, getBucketNames)
s3Csvs <- s3FileNames[str_detect(s3FileNames, ".csv") & str_detect(s3FileNames, "PPlusFinal")] ##leave out proxiswide.csv
s3Shpfiles <- s3FileNames[str_detect(s3FileNames, "shp.zip")] 
  
##Create the directories to dump the files from aws
shpDir <- file.path(homeDir, "pp-pipeline", "data", "shps")
csvDir <- file.path(homeDir, "pp-pipeline", "data", "csvs")
if(!dir.exists(shpDir)) dir.create(shpDir)
if(!dir.exists(csvDir)) dir.create(csvDir)
  
##get/read objects from bucket
csvObjs <- lapply(s3Csvs, function(x) get_object(x, what="raw", bucket = "property-praxis"))
names(csvObjs) <- s3Csvs

shpObjs <- lapply(s3Shpfiles, function(x) get_object(x, what="raw", bucket = "property-praxis"))
names(shpObjs) <- s3Shpfiles
  
##read to local env and write the binary object to disk for persistent storage
csvList <- lapply(seq_along(csvObjs), function(i){
  csv <- read_csv(rawToChar(csvObjs[[i]]), col_types = cols(propzip=col_character()))
  csvName <- basename(s3Csvs[[i]])
  write_csv(csv, file.path(csvDir, csvName))
  return(csv)
})
names(csvList) <- lapply(s3Csvs, function(x) basename(x)) %>% str_replace(".csv", "")
  
shpList <- lapply(seq_along(shpObjs), function(i){
  shpZipName <- basename(s3Shpfiles[[i]])
  shpName <- shpZipName %>% str_replace(".zip", "")
  writeBin(shpObjs[[i]], file.path(shpDir, shpZipName))
  unzip(file.path(shpDir, shpZipName), exdir=shpDir)
  shp <- st_read(file.path(shpDir, shpName))
  return(shp)
})
names(shpList) <- lapply(s3Shpfiles, function(x) basename(x)) %>% str_replace(".shp.zip", "")



##clean up the global env
#csvNames <- lapply(s3Csvs, function(x) basename(x)) %>% str_replace(".csv", "")
#shpNames <- lapply(s3Shpfiles, function(x) basename(x)) %>% str_replace(".shp.zip", "")
rm(list=c("csvObjs", 
          "shpObjs", 
          "s3Csvs", 
          "s3Shpfiles", 
          "s3FileNames", 
          "ppBucket", 
          "getBucketNames")); gc()


##DETROIT DATA GEOJSON######
##parcel data
try({
  gjUrl <- "https://opendata.arcgis.com/datasets/a210575930354d758c12d7f45eebaa2f_0.geojson"
  gj <- geojson_sf(gjUrl)
}) 
##zipcode data
try({
  zipUrl <- "https://opendata.arcgis.com/datasets/f6273f93db1b4f57b7091ef1f43271e7_0.geojson"
  zips <- geojson_sf(zipUrl)
}) 
#################################
##TABLE CLEANING / PREP PHASE
################################

##Tables:
## 1. parcels_property

##function to fix the differences in the names in each df
##any of the name chages should go in this fucntion
nameFixer <- function(df){
  names(df)[names(df) == "id_old"] <- "old_id"
  names(df)[names(df) %in% c("taxpayer 1", "taxpayer_1")] <- "taxpayer1"
  names(df)[names(df) %in% c("taxpayer 2", "taxpayer_2")] <- "taxpayer2"
  names(df)[names(df) == "cibyrbuilt"] <- "cityrbuilt"
  
  ##gj name changes
  names(df)[names(df) == "parcelnumber"] <- "parcelno"
  names(df)[names(df) == "address"] <- "propaddr"
  names(df)[names(df) == "zipcode"] <- "propzip"
  
  names(df)[names(df) == "taxpayerstreet"] <- "tpaddr"
  names(df)[names(df) == "taxpayercity"] <- "tpcity"
  names(df)[names(df) == "taxpayerzip"] <- "tpzip"
  names(df)[names(df) == "taxpayerstate"] <- "tpstate"
  
  names(df)[names(df) == "yearbuilt"] <- "resyrbuilt" ##this may be wrong / ask Josh
  names(df)[names(df) == "totalsquarefootage"] <- "totsqft"
  names(df)[names(df) == "taxpayerstate"] <- "totacres"
  return(df)
}

##function to add in the year col to csvList
addYear <- function(i, dfs){
  year <- names(dfs[i]) %>% str_split("_")
  year <- as.numeric(year[[1]][2])
  tmp_df <- dfs[[i]]
  if(is.numeric(year[[1]]) && !is.na(year[[1]])){
    tmp_df$praxisyear <- year
  }
  
  return(tmp_df)
}

##fix the geojson names
##fix names to follow the other praxis data
names(gj) <- str_replace_all(names(gj), "_", "")
gj <- nameFixer(gj)

##Fix col names
csvList <- lapply(csvList, nameFixer)
##Add the year col
csvList <- lapply(seq_along(csvList), addYear, dfs=csvList)

##Cols to keep
ppCols <- c("taxpayer1", 
            "taxpayer2", 
            "own_id",
            "tpaddr", 
            "tpcity", 
            "tpstate", 
            "tpzip", 
            "parcelno", 
            "propaddr", 
            "propno", 
            "propdir", 
            "propstr", 
            "propzip",
            "praxisyear",
            ##adding these field 
            ##provides no additional 
            ##records
            "taxstatus",
            "saledate",
            "saleprice",
            "totsqft",
            "totacres",
            "cityrbuilt",
            "resyrbuilt"
            #these last geom fields
            #need to be recalculated
            # "latitude",
            # "longitude",
            # "location"
)

##Bind the data to one DF
##bind the df list for a full dataset
ppFull <- bind_rows(csvList)
ppFull <- ppFull[, ppCols]
ppFull <- ppFull[!duplicated(ppFull),]

##cleanup env 
rm(list=c("csvList")); gc()
##parcels_property table
parPropCols <- c("parcelno", "propaddr") #PK
parProp <- ppFull[,parPropCols]
parProp <- parProp[!duplicated(parProp), ]
parProp$parprop_id <- paste("parprop", 1:nrow(parProp), sep="-")

##property table
propCols <- c("parcelno", 
              "propaddr", 
              "propno", 
              "propdir", 
              "propstr", 
              "propzip" 
) 

prop <- ppFull[,propCols]
prop <- prop[!duplicated(prop),]
prop$prop_id <- paste("prop", 1:nrow(prop), sep="-")
##add parprop_id to prop table
prop <- parProp %>% full_join(prop, by=c("parcelno"="parcelno", "propaddr"="propaddr"))

##owner_taxpayer table
ownTaxCols <- c("taxpayer1", "own_id")
ownTax <- ppFull[,ownTaxCols]
ownTax <- ownTax[!duplicated(ownTax),]
ownTax$owntax_id <- paste("owntax", 1:nrow(ownTax), sep="-")

##taxpayer table
taxCols <- c("own_id",
             "taxpayer1", 
             "taxpayer2", 
             "tpaddr", 
             "tpcity", 
             "tpstate", 
             "tpzip",
             "taxstatus")
tax <- ppFull[,taxCols]
tax <- tax[!duplicated(tax),]
tax$tp_id <- paste("tp", 1:nrow(tax), sep="-")

##add owntax_id to tax table
tax <- ownTax %>% full_join(tax, by=c("own_id", "taxpayer1"))

##Create join ids
taxParPropCols <- c("own_id",
                    "taxpayer1", 
                    "taxpayer2", 
                    "taxstatus",
                    "tpaddr", 
                    "tpcity", 
                    "tpstate", 
                    "tpzip", 
                    "parcelno", 
                    "propaddr", 
                    "propno", 
                    "propdir", 
                    "propstr", 
                    "propzip"
)

taxParProp <- ppFull[, taxParPropCols]
taxParProp <- taxParProp[!duplicated(taxParProp),]
taxParProp$taxparprop_id <- paste("tpp", 1:nrow(taxParProp), sep="-")

##create new ids
taxParPropwIds <- taxParProp %>% 
  full_join(tax, by=c("own_id", 
                      "taxpayer1", 
                      "taxpayer2", 
                      "tpaddr", 
                      "tpcity", 
                      "tpstate", 
                      "tpzip", 
                      "taxstatus")) %>%
  full_join(prop, by=c("parcelno", 
                       "propaddr", 
                       "propno", 
                       "propdir", 
                       "propstr", 
                       "propzip"))

##remove redundant cols
taxPropCols <- c("tp_id", "prop_id", "taxparprop_id")
taxProp <- taxParPropwIds[, taxPropCols]
taxProp <- taxProp[!duplicated(taxProp),]

##Back to Prop table
##remove redundant cols
prop <- prop[,c("prop_id",
                "parprop_id", 
                "propno", 
                "propdir", 
                "propstr", 
                "propzip")]

##Back to tax table
##remove redundant cols
tax <- tax[,c("tp_id",
              "owntax_id",
              "taxpayer2", 
              "tpaddr", 
              "tpcity", 
              "tpstate", 
              "tpzip",
              "taxstatus")]



##Rejoin everything
taxParProp <- parProp %>% full_join(prop, by=c("parprop_id")) %>%
  full_join(taxProp, by=c("prop_id")) %>%
  full_join(tax, by=c("tp_id")) %>% 
  full_join(ownTax, by=c("owntax_id")) 


##Year table prep build
yearCols <- c("own_id",
              "taxpayer1", 
              "taxpayer2", 
              "taxstatus",
              "tpaddr", 
              "tpcity", 
              "tpstate", 
              "tpzip", 
              "parcelno", 
              "propaddr", 
              "propno", 
              "propdir", 
              "propstr", 
              "propzip",
              ##year cols below
              "saledate",
              "saleprice",
              "totsqft",
              "totacres",
              "cityrbuilt",
              "resyrbuilt",
              "praxisyear"
)
year <- ppFull[,yearCols]
year <- year[!duplicated(year),]

##Join entire dataset to year
taxParPropYear <- taxParProp %>%
  full_join(year, by=c("own_id",
                       "taxpayer1", 
                       "taxpayer2", 
                       "taxstatus",
                       "tpaddr", 
                       "tpcity", 
                       "tpstate", 
                       "tpzip", 
                       "parcelno", 
                       "propaddr", 
                       "propno", 
                       "propdir", 
                       "propstr", 
                       "propzip"))



##remove redundant fields
year <- taxParPropYear[,c("taxparprop_id",
                          "saledate",
                          "saleprice",
                          "totsqft",
                          "totacres",
                          "cityrbuilt",
                          "resyrbuilt",
                          "praxisyear"
)]
year <- year[!duplicated(year),]

##create count column
##This can be joined to the full dataset
praxiscount <- taxParPropYear %>% 
  group_by(praxisyear, own_id) %>% 
  summarise(count=sum(n()))

shpList[["gj"]] <- gj
##geom table (uses praxis shaefiles and geojson)
geomList <- lapply(seq_along(shpList), function(i){
  shpName <- names(shpList[i])
  shp <- shpList[[shpName]][!is.na(shpList[[shpName]]$parcelno),
                            c("parcelno", "propaddr", "geometry")]
  # shp <- shp[!duplicated(shp),]
  shp$tmp_id <- paste0(shp$parcelno, shp$propaddr)
  dupIds <- unique(shp$tmp_id[duplicated(shp$tmp_id)])
  dupShp <- shp[shp$tmp_id %in% dupIds, ]
  dupShp <- dupShp %>% group_by(parcelno, propaddr) %>% 
    summarise(geometry=st_union(geometry), geom_agg_count=n())
  
  uniShp <- shp[!shp$tmp_id %in% dupIds, ]
  shp <- bind_rows(dupShp, uniShp)
  
  geom <- parProp %>% 
    inner_join(shp, by=c("parcelno", "propaddr"))
  geom <- geom[,c("parprop_id", "parcelno", "propaddr", "geom_agg_count", "geometry")]
  geom <- st_as_sf(geom[!duplicated(geom),])
  st_crs(geom) = 4326
  return(geom)
})

##Add the geojson to the list
# geomList[["gj"]] <- gj
names(geomList) <- c(paste0("geom_", str_sub(names(shpList), start=-4, end=-1)))

#######
geomList2 <- lapply(seq_along(geomList), function(i){
  geomName <- names(geomList[i])
  geom <- geomList[[geomName]][,c("parprop_id", "geometry")] %>%
    right_join(parProp, by=c("parprop_id"))
  names(geom)[names(geom)=="geometry"] <- geomName
  st_geometry(geom) <- geomName
  return(geom)
})

geomAll <- bind_cols(geomList2)
geomCols <- names(geomAll)[str_detect(names(geomAll), "geom")]
parPropGeom <- geomAll[,c("parprop_id", "parcelno", "propaddr", geomCols)]
# st_geometry(parPropGeom) <- "gj"

  
##Remove intermediary tables from local env
rm(list=c("taxParProp",
          "taxParPropwIds",
          "shpList",
          "geomList",
          "geomList2")); gc()

###################
##DB POPULATING PHASE
###################
##Create connection to DB
conn <- RPostgreSQL::dbConnect("PostgreSQL", 
                               host = "postgres",
                               dbname = "db", 
                               user = "user", 
                               password = "pass")
##get PG version
dbGetQuery(conn, 'SELECT version();')
#check that Post GIS is installed
pgPostGIS(conn)
pgListGeom(conn, geog = TRUE)


# dbSendQuery(conn, "CREATE SCHEMA ppraxis;")
#pgInsert(conn, name=c("ppraxis", "parcel_property_geom"), data.obj=parPropGeom, geom="geom_gj")

# sf::st_write(parPropGeom, dsn=conn, Id(schema="ppraxis", table="parcel_property_geom"),  overwrite = FALSE, append = FALSE)
# dbSendQuery(conn, "DROP TABLE IF EXISTS tax_property;")
# dbSendQuery(conn, "DROP TABLE IF EXISTS ppraxis")
# 
# dbGetQuery(conn, "SELECT * parcel_property_geom;")
# dbListFields(conn, "*")
# dbGetQuery(conn,
#            "SELECT * FROM information_schema.tables
#                    WHERE table_schema='ppraxis'")

####using the public schema
##Add geom tables
sf::st_write(parPropGeom, dsn=conn, layer="parcel_property_geom",  overwrite = FALSE, append = FALSE)
sf::st_write(zips, dsn=conn, layer="zips_geom",  overwrite = FALSE, append = FALSE)

##Add regular tables
if(!RPostgreSQL::dbExistsTable(conn, "property")){
  RPostgreSQL::dbWriteTable(conn, "property", prop)
}

if(!RPostgreSQL::dbExistsTable(conn, "taxpayer_property")){
  RPostgreSQL::dbWriteTable(conn, "taxpayer_property", taxProp)
}

if(!RPostgreSQL::dbExistsTable(conn, "year")){
  RPostgreSQL::dbWriteTable(conn, "year", year)
}

if(!RPostgreSQL::dbExistsTable(conn, "taxpayer")){
  RPostgreSQL::dbWriteTable(conn, "taxpayer", tax)
}

if(!RPostgreSQL::dbExistsTable(conn, "owner_taxpayer")){
  RPostgreSQL::dbWriteTable(conn, "owner_taxpayer", ownTax)
}


##create PKs
dbSendQuery(conn,  paste("ALTER TABLE parcel_property_geom",
                         "ADD CONSTRAINT parcel_property_pk",
                         "PRIMARY KEY (parprop_id);"))

dbSendQuery(conn,  paste("ALTER TABLE property",
                         "ADD CONSTRAINT property_pk",
                         "PRIMARY KEY (prop_id);"))

dbSendQuery(conn,  paste("ALTER TABLE taxpayer_property",
                         "ADD CONSTRAINT taxpayer_property_pk",
                         "PRIMARY KEY (taxparprop_id);"))

dbSendQuery(conn,  paste("ALTER TABLE year",
                         "ADD CONSTRAINT year_pk",
                         "PRIMARY KEY (taxparprop_id, praxisyear);"))

dbSendQuery(conn,  paste("ALTER TABLE taxpayer",
                         "ADD CONSTRAINT taxpayer_pk",
                         "PRIMARY KEY (tp_id);"))

dbSendQuery(conn,  paste("ALTER TABLE owner_taxpayer",
                         "ADD CONSTRAINT owner_taxpayer_pk",
                         "PRIMARY KEY (owntax_id);"))


##create Fks
dbSendQuery(conn, paste("ALTER TABLE property",
                        "ADD CONSTRAINT property_fk FOREIGN KEY (parprop_id) REFERENCES parcel_property_geom (parprop_id);"))

dbSendQuery(conn, paste("ALTER TABLE taxpayer_property",
                        "ADD CONSTRAINT taxpayer_property_prop_fk FOREIGN KEY (prop_id) REFERENCES property (prop_id);"))
dbSendQuery(conn, paste("ALTER TABLE taxpayer_property",
                        "ADD CONSTRAINT taxpayer_property_tp_fk FOREIGN KEY (tp_id) REFERENCES taxpayer (tp_id);"))

dbSendQuery(conn, paste("ALTER TABLE year",
                        "ADD CONSTRAINT year_fk FOREIGN KEY (taxparprop_id) REFERENCES taxpayer_property (taxparprop_id)"))

dbSendQuery(conn, paste("ALTER TABLE taxpayer",
                        "ADD CONSTRAINT taxpayer_fk FOREIGN KEY (owntax_id) REFERENCES owner_taxpayer (owntax_id)"))

##Test joins
# geomName <- names(geomList[1])
# geom <- geomList[[geomName]][,c("parprop_id", "geometry")] %>%
#   right_join(parProp, by=c("parprop_id"))
# names(geom)[names(geom)=="geometry"] <- geomName
# st_geometry(geom) <- geomName
# 
# x <- geomList2[[1]]
# 
# 
# geomName <- names( geomList[1])
# geom <- geomList[[geomName]][,c("parprop_id", "geometry")] %>%
#   right_join(parProp, by=c("parprop_id"))
# names(geom)[names(geom)=="geometry"] <- geomName
# 
# 
# ######
# x <- geomList[[1]][76465,]
# plot(x)
# 
# y <- x[x$parprop_id %in% "parprop-1949",]
# plot(y$geometry)
# 
# #####
# shpName <- names(shpList[1])
# # year <- str_sub(shpName, start=-4, end=-1)
# shp <- shpList[[shpName]][!is.na(shpList[[shpName]]$parcelno),
#                           c("parcelno", "propaddr", "geometry")]
# shp <- shp[!duplicated(shp),]
# # shp$year <- year
# shp$tmp_id <- paste0(shp$parcelno, shp$propaddr)
# dupIds <- unique(shp$tmp_id[duplicated(shp$tmp_id)])
# dupShp <- shp[shp$tmp_id %in% dupIds, ]
# dupShp <- dupShp %>% group_by(parcelno, propaddr) %>% summarise(geometry=st_union(geometry))
# 
# uniShp <- shp[!shp$tmp_id %in% dupIds, ]
# shp <- bind_rows(dupShp, uniShp)
# 
# geom <- parProp %>% 
#   inner_join(shp, by=c("parcelno", "propaddr"))
# geom <- geom[,c("parprop_id", "parcelno", "propaddr", "geometry")]
# geom <- geom[!duplicated(geom),]
# 
# 
# shp <- shpList[["praxis2015"]][!is.na(shpList[["praxis2015"]]$parcelno),]
# shp$id <- paste0(shp$parcelno, shp$propaddr)
# shpDup <- shp[duplicated(shp$id),]
# odd2015 <- shp[shp$parcelno %in% unique(shpDup$parcelno),]
# 
# shp <- shpList[["praxis2016"]][!is.na(shpList[["praxis2016"]]$parcelno),]
# shp$id <- paste0(shp$parcelno, shp$propaddr)
# shpDup <- shp[duplicated(shp$id),]
# odd2016 <- shp[shp$parcelno %in% unique(shpDup$parcelno),]
# 
# shp <- shpList[["praxis2017"]][!is.na(shpList[["praxis2017"]]$parcelno),]
# shp$id <- paste0(shp$parcelno, shp$propaddr)
# shpDup <- shp[duplicated(shp$id),]
# odd2017 <- shp[shp$parcelno %in% unique(shpDup$parcelno),]
# 
# 
# # st_write(odd2015, "/home/rstudio/pp-pipeline/data/shps/odd2015.shp")
# # st_write(odd2016, "/home/rstudio/pp-pipeline/data/shps/odd2016.shp")
# # st_write(odd2017, "/home/rstudio/pp-pipeline/data/shps/odd2017.shp")
# 
# union2015 <- odd2015 %>% group_by(id) %>% summarise(geom=st_union(geometry))
# plot(union2015[union2015$id %in% "22020569.9360 PRAIRIE", ])
# 
# shp <- shpList[["praxis2015"]][!is.na(shpList[["praxis2015"]]$parcelno),]
# shp$id <- paste0(shp$parcelno, shp$propaddr)
# shp <- shp[!duplicated(shp),]
# union2015All <- shp %>% group_by(id) %>% summarise(geom=st_union(geometry))
# 
# 
# 
# ##redo
# shpName <- names(shpList[1])
# # year <- str_sub(shpName, start=-4, end=-1)
# oddUnion <- odd2015 %>% group_by(parcelno, propaddr) %>% summarise(geometry=st_union(geometry))
# 
# 
# 
# # shp$year <- year
# geom <- parProp %>% 
#   inner_join(shp, by=c("parcelno", "propaddr"))
# geom <- geom[,c("parprop_id", "parcelno", "propaddr", "geometry")]
# geom <- geom[!duplicated(geom),]
# 
# 
# pp <- geomList[[1]]
# dup <- pp[duplicated(pp$parprop_id),]
# length(unique(pp$parprop_id))
# 
# x <- taxParPropYear[taxParPropYear$parprop_id=="parprop-12357",]
# x <- geomList[[1]]
# x <- x[x$parcelno %in% "22020569.",]
# 
# plot(x$geometry[8])
# 
# parPropGeom <- sapply(geomList, function(name){
#   
# })
# propYearJoined <- parProp %>% 
#   full_join(prop, by=c("propaddr"="propaddr", "parcelno"="parcelno")) %>%
#   full_join(year, by=c("parcelno"="parcelno",
#                               "propaddr"="propaddr",
#                               "propno"="propno",
#                               "propdir"="propdir",
#                               "propstr"="propstr",
#                               "propzip"="propzip"))
# ##check must be true
# if(nrow(propYearJoined)==nrow(year)){
#   print("Join validated.")
# }else{
#   print("Join invalidated.")
# }
# 
# ##Year table (resuing var names)
# yearCols <- c("prop_id", 
#           "praxisyear", 
#           "saledate",
#           "saleprice",
#           "totsqft",
#           "totacres",
#           "cityrbuilt",
#           "resyrbuilt"
#           )
# year <- propYearJoined[,yearCols]
# year <- year[!duplicated(year),]
# 
# ##This is the full joined table for parcels, properties, and year
# parPropYearFull <- parProp %>% full_join(prop, by=c("parprop_id"="parprop_id")) %>%
#   full_join(year, by=c("prop_id"="prop_id"))
# 
# 
# ##owner_taxpayer table
# ownTaxCols <- c("taxpayer1", "own_id")
# ownTax <- ppFull[,ownTaxCols]
# ownTax <- ownTax[!duplicated(ownTax),]
# ownTax$owntax_id <- paste("owntax", 1:nrow(ownTax), sep="-")


# ##taxpayer table
# taxCols <- c("own_id",
#              "taxpayer1", 
#              "taxpayer2", 
#              "tpaddr", 
#              "tpcity", 
#              "tpstate", 
#              "tpzip",
#              "taxstatus")
# tax <- ppFull[,taxCols]
# tax <- tax[!duplicated(tax),]
# tax$tp_id <- paste("tp", 1:nrow(tax), sep="-")
# 
# ##add owntax_id to tax table
# tax <- ownTax %>% full_join(tax, by=c("own_id"="own_id", "taxpayer1"="taxpayer1"))
# tax <- tax[,c("tp_id",
#               "owntax_id",
#               "taxpayer2", 
#               "tpaddr", 
#               "tpcity", 
#               "tpstate", 
#               "tpzip",
#               "taxstatus")]
# ##Test joins
# taxParPropCols <- c("own_id",
#                     "taxpayer1", 
#                     "taxpayer2", 
#                     "taxstatus",
#                     "tpaddr", 
#                     "tpcity", 
#                     "tpstate", 
#                     "tpzip", 
#                     "parcelno", 
#                     "propaddr", 
#                     "propno", 
#                     "propdir", 
#                     "propstr", 
#                     "propzip",
#                     "saledate",
#                     "saleprice",
#                     "totsqft",
#                     "totacres",
#                     "cityrbuilt",
#                     "resyrbuilt"
#                     )
# taxParProp <- ppFull[, taxParPropCols]
# taxParProp <- taxParProp[!dupicated(taxParProp),]

###############
##DB POPULATING
###############

# The tables are:
#   1. Taxpayer
#   2. Property






##testing#####################
# x <- csvList[[3]]
# names(pp_full)
# dfs <- csvList
# year <- names(dfs[3]) %>% str_split("_")
# year <- as.numeric(year[[1]][2])
# tmp_df <- dfs[[3]]
# if(is.numeric(year[[1]]) && !is.na(year[[1]])){
#   tmp_df$year <- year
# }
###################


##testing for csvs
# bucket <- get_bucket("property-praxis")
# rawCsv <- get_object("PPlusFinal_2016.csv", bucket = "property-praxis")
# #note it is important to set the coltypes to avaoid errors when parsing
# csv <- read_csv(rawToChar(rawCsv), col_types = cols(propzip=col_character()))
# 
# ##testing for shapefiles
# rawShpZip <- get_object("Praxis Shapefiles/praxis2016.shp.zip", bucket = "property-praxis", what="raw", n=1e6)
# 
# tmp <- tempfile()
# writeBin(rawShpZip, tmp)
# tmp <- unzip(tmp, exdir=tempdir())
# shp <- st_read("/tmp/Rtmprwn3Hy/praxis2016.shp/praxis2016.shp")
# unlink(tmp)
# #x <- readBin(rawShpZip, character(), n=length(rawShpZip))
# 
# ##or in a reg dir
# writeBin(rawShpZip, "test.zip")
# test <- unzip("test.zip", exdir="/home/rstudio")
# temp <- tempfile(rawShpZip)
# unzip(rawShpZ)

# x <- readBin(raxShpZip, what="raw") 
# base64_dec(rawShpZip)
##testing for zips

###
# shpZipName <- basename(s3Shpfiles[[2]])
# shpName <- shpZipName %>% str_replace(".zip", "")
# writeBin(shpObjs[[2]], file.path(shpDir, shpZipName))
# unzip(file.path(shpDir, shpZipName), exdir=shpDir)
# shp <- st_read(file.path(shpDir, shpName))
# return(shp)
