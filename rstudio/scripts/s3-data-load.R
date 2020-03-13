options(stringsAsFactors = FALSE)
if(!require(httr)) install.packages("httr") 
if(!require(aws.s3)) install.packages("aws.s3")
if(!require(rpostgis)) install.packages("rpostgis")
if(!require(readr)) install.packages("readr")
if(!require(readr)) install.packages("readxl")
if(!require(stringr)) install.packages("stringr")
if(!require(dplyr)) install.packages("dplyr")
if(!require(sf)) install.packages("sf")
if(!require(geojsonsf)) install.packages("geojsonsf")
if(!require(dotenv)) install.packages("dotenv")
if(!require(pacman)) install.packages("pacman"); library(pacman)
p_load(aws.s3, httr, rpostgis, readr, readxl, stringr, dplyr, sf, geojsonsf, dotenv)

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

###
# AWSObjectsTo(bucket){
#   } 
######



##separate file names into different lists
s3FileNames <- lapply(ppBucket, getBucketNames)
# s3Csvs <- s3FileNames[str_detect(s3FileNames, ".csv") & str_detect(s3FileNames, "PPlusFinal")] ##leave out proxiswide.csv
s3Csvs <- s3FileNames[str_detect(s3FileNames, ".csv") & str_detect(s3FileNames, "_edit")] ##these are the edited files with field_21 added
s3Shpfiles <- s3FileNames[str_detect(s3FileNames, "shp.zip")] 

##avail years
yearList  <- lapply(s3Csvs, function(x){
  base <- basename(x) %>% 
    str_replace( "PPlusFinal_", "") %>%
    str_replace("_edit.csv", "")
})
  
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
  csv <- read_csv(rawToChar(csvObjs[[i]]), col_types = cols(propzip=col_character(), parcelno=col_character()))
  csvName <- basename(s3Csvs[[i]])
  write_csv(csv, file.path(csvDir, csvName))
  return(csv)
})
# names(csvList) <- lapply(s3Csvs, function(x) basename(x)) %>% str_replace(".csv", "")
names(csvList) <- lapply(s3Csvs, function(x) basename(x)) %>% 
  str_replace("_edit.csv", "") 


shpList <- lapply(seq_along(shpObjs), function(i){
  shpZipName <- basename(s3Shpfiles[[i]])
  shpName <- shpZipName %>% str_replace(".zip", "")
  writeBin(shpObjs[[i]], file.path(shpDir, shpZipName))
  unzip(file.path(shpDir, shpZipName), exdir=shpDir)
  shp <- st_read(file.path(shpDir, shpName), stringsAsFactors=FALSE)
  return(shp)
})
names(shpList) <- lapply(s3Shpfiles, function(x) basename(x)) %>% 
  str_replace(".shp.zip", "")

##clean up the global env
#csvNames <- lapply(s3Csvs, function(x) basename(x)) %>% str_replace(".csv", "")
#shpNames <- lapply(s3Shpfiles, function(x) basename(x)) %>% str_replace(".shp.zip", "")
gc(rm(list=c("csvObjs", 
          "shpObjs", 
          "s3Csvs", 
          "s3Shpfiles", 
          "s3FileNames", 
          "ppBucket", 
          "getBucketNames")))


##DETROIT DATA GEOJSON######
##Get parcel data
try({
  gjUrl <- Sys.getenv("PARCELS_URL")
  gj <- geojson_sf(gjUrl)
}) 
##Get zipcode data
try({
  zipUrl <- Sys.getenv("ZIP_URL")
  zips <- geojson_sf(zipUrl)
}) 

#################################
##TABLE CLEANING / PREP PHASE
################################

##Tables:
## 1. parcels_property
## 2. owner_taxpayer
## 3. parcel_property_geom
## 4. property
## 5. taxpayer          
## 6. taxpayer_property       
## 7. year             
## 8. zips_geom

##Views:
## TDB

####Function
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

###function to make the parcel numbers be the same in csv and shp

parcelnoFixer <- function (df){
  col <- df$parcelno
  
  ##add the period that was removed
  newCol <- lapply(col, function(val){
    if(str_detect(val, fixed(".")) || str_detect(val, fixed("-"))){
      return(val)
    }else{
      return(paste0(val, "."))
    }
  })
  
  
  ##add the zero that was removed
  zeroCol <- lapply(newCol, function(val){
    if(nchar(val) == 8 && str_sub(val, start = -1, end = -1) == "."){
      return(paste0("0", val))
    }else{
      return(val)
    }
  })
  df$parcelno <- unlist(zeroCol)
  return(df)
}


##fix the geojson names
##fix names to follow the other praxis data
names(gj) <- str_replace_all(names(gj), "_", "")
gj <- nameFixer(gj)
##add it to the shpList
shpList[["gj"]] <- gj

##Fix col names
csvList <- lapply(csvList, nameFixer)
##Add the year col
csvList <- lapply(seq_along(csvList), addYear, dfs=csvList)
##fix parcelno col
csvList <- lapply(csvList, parcelnoFixer)


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
            "resyrbuilt",
            "field_21"
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
gc(rm(list=c("csvList")))
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
prop <- parProp %>% 
  full_join(prop, by=c("parcelno"="parcelno", "propaddr"="propaddr"))

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

##
# shpList[["gj"]] <- gj
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





##Remove intermediary tables from local env
gc(rm(list=c("taxParProp",
          "taxParPropwIds",
          "shpList",
          "geomList",
          "geomList2",
          "taxParPropYear",
          "gj",
          "ppFull",
          "parProp")))


###################
##DB POPULATING PHASE
###################
##Create connection to DB
conn <- RPostgreSQL::dbConnect("PostgreSQL", 
                               host = "postgres",
                               dbname = "db", 
                               user = Sys.getenv("DB_USER"), 
                               password = Sys.getenv("DB_PASSWORD"))
##get PG version
dbGetQuery(conn, 'SELECT version();')
#check that Post GIS is installed
pgPostGIS(conn)
pgListGeom(conn, geog = TRUE)


####using the public schema
##Add geom tables
dbSendQuery(conn, "DROP TABLE IF EXISTS parcel_property_geom CASCADE;")
sf::st_write(parPropGeom, dsn=conn, layer="parcel_property_geom",  overwrite = TRUE, append = FALSE)
dbSendQuery(conn, "DROP TABLE IF EXISTS zips_geom CASCADE;")
sf::st_write(zips, dsn=conn, layer="zips_geom",  overwrite = TRUE, append = FALSE)

##Add regular tables
if(RPostgreSQL::dbExistsTable(conn, "property")){
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS property CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "property", prop)
}

if(RPostgreSQL::dbExistsTable(conn, "taxpayer_property")){
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS taxpayer_property CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "taxpayer_property", taxProp)
}

if(RPostgreSQL::dbExistsTable(conn, "year")){
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS year CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "year", year)
}

if(RPostgreSQL::dbExistsTable(conn, "taxpayer")){
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS taxpayer CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "taxpayer", tax)
}

if(RPostgreSQL::dbExistsTable(conn, "owner_taxpayer")){
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS owner_taxpayer CASCADE;")
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


createOwnerCount <- function(){
  dbSendQuery(conn, paste("DROP TABLE IF EXISTS owner_count;",
                          "CREATE TABLE owner_count AS",
                          "(SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) as count FROM parcel_property_geom AS ppg",
                          "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
                          "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
                          "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
                          "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
                          "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
                          "GROUP BY y.praxisyear, ot.own_id)"))
}

createOwnerCount()

##Create Views
##These need to be automated
createParcelGeomByYear <- function(years){ ##must be a list
  lapply(years, function(year){
    dbSendQuery(conn, paste("DROP VIEW IF EXISTS ", paste0("parcels_", year), "CASCADE;",
                            "CREATE VIEW ", paste0("parcels_", year), "AS",
                            "(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) AS id, y.praxisyear, ot.own_id, count.count, p.propzip, ", paste0("geom_", year), "FROM parcel_property_geom AS ppg",
                            "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
                            "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
                            "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
                            "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
                            "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
                            "INNER JOIN (",
                            "SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) FROM parcel_property_geom AS ppg",
                            "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
                            "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
                            "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
                            "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
                            "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
                            "GROUP BY y.praxisyear, ot.own_id)", 
                            "AS count ON y.praxisyear = count.praxisyear AND ot.own_id = count.own_id",
                            "WHERE y.praxisyear", paste0("= ", year), "AND count.count > 9);"))
  })
}

createParcelGeomByYear(yearList)


# dbSendQuery(conn, paste("DROP VIEW IF EXISTS parcels_2017;",
#                         "CREATE VIEW parcels_2017 AS",
#                         "(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) AS id, y.praxisyear, ot.own_id, count.count, geom_2017 FROM parcel_property_geom AS ppg",
#                         "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                         "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                         "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                         "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                         "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                         "INNER JOIN (",
#                           "SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) FROM parcel_property_geom AS ppg",
#                           "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                           "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                           "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                           "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                           "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                           "GROUP BY y.praxisyear, ot.own_id)", 
#                         "AS count ON y.praxisyear = count.praxisyear AND ot.own_id = count.own_id",
#                         "WHERE y.praxisyear = 2017 AND count.count > 9);"))
##parcels_centroid_2017
# dbSendQuery(conn, paste("DROP VIEW IF EXISTS parcels_centroid_2017;",
#                         "CREATE VIEW parcels_centroid_2017 AS",
#                         "(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) AS id, y.praxisyear, ot.own_id, count.count, ST_CENTROID(geom_2017) as centroid FROM parcel_property_geom AS ppg",
#                         "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                         "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                         "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                         "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                         "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                         "INNER JOIN (",
#                           "SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) FROM parcel_property_geom AS ppg",
#                           "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                           "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                           "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                           "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                           "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                           "GROUP BY y.praxisyear, ot.own_id)", 
#                         "AS count ON y.praxisyear = count.praxisyear AND ot.own_id = count.own_id",
#                         "WHERE y.praxisyear = 2017 AND count.count > 9);"))

#####TESTING
x <- dbGetQuery(conn, paste("SELECT * FROM "))
# x <- sf::st_read(conn, query=paste("SELECT DISTINCT pp.*, p.*, otp.own_id, y.praxisyear FROM parcel_property_geom as pp
#     INNER JOIN property as p ON pp.parprop_id = p.parprop_id
#     INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
#     INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
#     INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
#     INNER JOIN owner_taxpayer as otp ON tp.owntax_id = otp.owntax_id
#     WHERE otp.own_id LIKE '%DELMIKO VAUGHN%' AND y.praxisyear = 2017"))
# 
# x <- sf::st_read(conn, query=paste("SELECT * FROM parcels_2017"))
# test <- sf::st_read(conn, query="SELECT * FROM parcels_2016;")
# geom_2017 <- sf::st_read(conn, query=paste(paste("SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) AS id, y.praxisyear, ot.own_id, count.count, geom_2017 FROM parcel_property_geom AS ppg",
#                                              "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                                              "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                                              "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                                              "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                                              "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                                              "INNER JOIN (",
#                                                "SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) FROM parcel_property_geom AS ppg",
#                                                "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                                                "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                                                "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                                                "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                                                "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                                                "GROUP BY y.praxisyear, ot.own_id) AS count ON y.praxisyear = count.praxisyear AND ot.own_id = count.own_id",
#                                              "WHERE y.praxisyear = 2017 AND count.count > 9")))
# 
# 
# 
# own_count <- dbGetQuery(conn, paste("SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) as count FROM parcel_property_geom AS ppg",
#                               "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                               "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                               "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                               "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                               "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                               "GROUP BY y.praxisyear, ot.own_id"))
# 
# own <- dbGetQuery(conn, paste("SELECT DISTINCT * FROM owner_count",
# "WHERE own_id LIKE 'MI KELLY'",
# "AND levenshtein(own_id, 'MICHAEL KELLY') <= 15",
# "AND praxisyear=2017",
# "ORDER BY count DESC;"))
# 
# 
# ## Create geojson in db
# dbSendQuery(conn, paste("DROP VIEW IF EXISTS parcels_gj;",
#                         "CREATE VIEW parcels_gj AS",
#                         "(SELECT jsonb_build_object(",
#                         "'type',     'FeatureCollection',",
#                         "'features', jsonb_agg(feature)",
#                         ")",
#                         "FROM (",
#                         "SELECT jsonb_build_object(",
#                         "'type',       'Feature',",
#                         "'geometry',   ST_AsGeoJSON(geom_2017)::json,",
#                         "'properties', to_jsonb(inputs) - 'geom_2017'",
#                         ") AS feature",
#                         "FROM (",
#                         "SELECT * FROM parcels_2017",
#                         ") inputs",
#                         ") features);"))
# 
# ##test
# x <- dbGetQuery(conn, "SELECT * from property LIMIT 1000;")

# `SELECT jsonb_build_object(
#   'type',     'FeatureCollection',
#   'features', jsonb_agg(feature)
# )
# FROM (
#   SELECT jsonb_build_object(
#     'type',       'Feature',
#     'id',          id,
#     'geometry',   ST_AsGeoJSON(geom_2017)::json,
#     'properties', to_jsonb(inputs) - 'geom_2017'
#   ) AS feature
#   FROM (
#     SELECT * FROM parcels_2017
#   ) inputs
# ) features;`;
##testing queries
# shpName <- names(shpList[4])
# shp <- shpList[[shpName]][!is.na(shpList[[shpName]]$parcelno),
#                           c("parcelno", "propaddr", "geometry")]
# # shp <- shp[!duplicated(shp),]
# shp$tmp_id <- paste0(shp$parcelno, shp$propaddr)
# dupIds <- unique(shp$tmp_id[duplicated(shp$tmp_id)])
# dupShp <- shp[shp$tmp_id %in% dupIds, ]
# dupShp <- dupShp %>% group_by(parcelno, propaddr) %>% 
#   summarise(geometry=st_union(geometry), geom_agg_count=n())
# 
# uniShp <- shp[!shp$tmp_id %in% dupIds, ]
# shp <- bind_rows(dupShp, uniShp)
# 
# geom <- parProp %>% 
#   inner_join(shp, by=c("parcelno", "propaddr"))
# geom <- geom[,c("parprop_id", "parcelno", "propaddr", "geom_agg_count", "geometry")]
# geom <- st_as_sf(geom[!duplicated(geom),])
# st_crs(geom) = 4326

# x <- dbGetQuery(conn, paste("SELECT DISTINCT ppg.parprop_id, ppg.parcelno, ppg.propaddr, ot.own_id, geom_gj FROM parcel_property_geom AS ppg",
#                         "LEFT JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                        "LEFT JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                        "LEFT JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                        "LEFT JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id;"))
# 
# 
# 
# # x <- dbGetQuery(conn, "SELECT * FROM current_parcels;")
# gemo_gj <- sf::st_read(conn, query=paste("SELECT DISTINCT ppg.parprop_id, ppg.parcelno, ppg.propaddr, ot.own_id, geom_gj FROM parcel_property_geom AS ppg",
#                                    "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                                    "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                                    "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                                    "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id;"))
# 
# 
# geom_2017 <- sf::st_read(conn, query=paste("SELECT DISTINCT ppg.parprop_id, ppg.parcelno, ppg.propaddr, ot.own_id, y.praxisyear, geom_2017 FROM parcel_property_geom AS ppg",
#                                            "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
#                                            "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
#                                            "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
#                                            "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
#                                            "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
#                                            "WHERE y.praxisyear = 2017"))
# 
# ##Test joins
# ######### TEST>>>>>>>>>>>
# ##2016 csv
# csv2015 <- csvList[[1]]
# shp2015 <- shpList[[1]]
# csv2016 <- csvList[[2]]
# shp2016 <- shpList[[2]]
# csv2017 <- csvList[[3]]
# shp2017 <- shpList[[3]]
# 
# shp2017sub <- shp2017[shp2017$propaddr %in% "605 CHALMERS", ]
# csv2017sub <- csv2017[csv2017$propaddr %in% "605 CHALMERS" ,]
# pp2017 <- parPropGeom[parPropGeom$propaddr %in% "605 CHALMERS",]
# 
# 
# csv2017sub2 <- csv2017[csv2017$propaddr %in% c("17415 OMIRA", "1734 VIRGINIA PARK", "289 WORCESTER P") ,]
# shp2017sub2 <- shp2017[shp2017$propaddr %in% c("17415 OMIRA", "1734 VIRGINIA PARK", "289 WORCESTER P") ,]
# pp20172 <- parPropGeom[parPropGeom$propaddr %in% c("17415 OMIRA", "1734 VIRGINIA PARK", "289 WORCESTER P") ,]
# ppt <- bind_rows(csv2017sub2, shp2017sub2, pp20172 )
# 
# 
# ppgeomsub <- parPropGeom[(length(parPropGeom$geom_2015) == 0),]
# 
# len_2015 <- sapply(parPropGeom$geom_2015[1:10], function(x){
#   length(x)
# })
# 
# 
# 
# ########TEST^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6
# z <- parPropGeom[parPropGeom$propaddr %in% "1545 CHERBONEAU PL",]
# s <- shpList[[3]]
# s <- s[s$propaddr %in% "1545 CHERBONEAU PL",]
# 
# p <- parProp[parProp$propaddr %in% "1545 CHERBONEAU PL",]
# 
# c <- ppFull[ppFull$propaddr %in% "1545 CHERBONEAU PL", ]
# c1 <- csvList[[1]] 
# c1 <- c1[c1$propaddr %in% "1545 CHERBONEAU PL", ]
# c2 <- csvList[[2]] 
# c2 <- c2[c2$propaddr %in% "1545 CHERBONEAU PL", ]
# c3 <- csvList[[3]] 
# c3 <- c3[c3$propaddr %in% "1545 CHERBONEAU PL", ]
# 
# r <- read_csv(rawToChar(csvObjs[[3]]), col_types = cols(propzip=col_character(), parcelno=col_character()))
# r <- r[r$propaddr %in% "1545 CHERBONEAU PL", ]
# 
# r2 <- read_csv("/home/rstudio/pp-pipeline/data/csvs/PPlusFinal_2017.csv", col_types = cols(propzip=col_character(), parcelno=col_character()))
# r2 <- r2[r2$propaddr %in% "1545 CHERBONEAU PL", ]
# 
# r2o <- read_csv("/home/rstudio/pp-pipeline/data/PPlusFinal_2017.csv", col_types = cols(propzip=col_character(), parcelno=col_character()), trim_ws = TRUE)
# r2o <- r2o[r2o$propaddr %in% "1545 CHERBONEAU PL", ]
# 
# xl <- read_xlsx("/home/rstudio/pp-pipeline/data/PPlusFinal_2017.xlsx")
# 
# r2oo <- read.csv("/home/rstudio/pp-pipeline/data/PPlusFinal_2017.csv",  colClasses=c("parcelno"="character"))
# 
# 
# gjc <- gj[gj$propaddr %in%"1545 CHERBONEAU PL",]
# 
# g <- geomList[[3]]
# g <- g[g$propaddr %in% "1545 CHERBONEAU PL",]
# 
# pp <- get_object("praxis_csvs/PPlusFinal_2017.csv", bucket = "property-praxis")
# 
# ppr <- read_csv2(rawToChar(pp))
# ppr <- ppr[ppr$propaddr %in%"1545 CHERBONEAU PL",]
# 
# sh17 <- 
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
