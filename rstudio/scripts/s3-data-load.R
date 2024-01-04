options(stringsAsFactors = FALSE)
options(dplyr.summarise.inform = FALSE)
if (!require(pacman)) {
  install.packages("pacman")
}
library(pacman)
p_load(aws.s3, rpostgis, readr, stringr, dplyr, sf, geojsonsf, dotenv, fs, purrr, glue, logger)

#################
## ENV SETUP PHASE
#################

## Load env vars
homeDir <- try(system("echo $HOME", intern = TRUE))
## docker specific logic for running docker exec
#
if (homeDir == "/root") {
  ## for prod it should be
  homeDir <- "/home/rstudio"
}

log_info(
  paste0(
    "Loading environment variables from ",
    homeDir,
    "/pp-pipeline/scripts/rstudio.env"
  )
)
dotenv::load_dot_env(file = paste0(homeDir, "/pp-pipeline/scripts/rstudio.env"))

bucket <- Sys.getenv("S3_BUCKET", "property-praxis-data")

#####################
## DATA FETCHING PAHSE
#####################

## AWS S3 DATA ########
## Download all relevant S3 data to populate DB
## Note if there is a 403 error, you may need to docker-compose up --build
tryCatch(
  {
    log_info("Fetching property praxis bucket data.")

    ppBucket <- get_bucket(bucket)

    ## function to get file names
    getBucketNames <- function(x) {
      bucketName <- x[[1]][1]
      log_info(paste("Found ", bucketName))
      return(bucketName)
    }
  },
  ## log_info warning message
  warning = function(w) {
    log_warn("Warning while getting bucket names...")
    log_warn(w)
  }
)


## separate file names into different lists
s3FileNames <- map(ppBucket, getBucketNames)
s3Csvs <-
  s3FileNames[str_detect(s3FileNames, ".csv") &
    str_detect(s3FileNames, "_edit")] ## these are the edited files with field_21 added
walk(paste("Keeping CSV filename", s3Csvs), log_info)

s3Shpfiles <- s3FileNames[str_detect(s3FileNames, "shp.zip")]
walk(paste("Keeping Shapefile filename", s3Shpfiles), log_info)


## available years
yearList <- map(s3Csvs, function(x) {
  base <- basename(x) %>%
    str_replace("PPlusFinal_", "") %>%
    str_replace("_edit.csv", "")
  log_info(paste("Available year", base))
  return(base)
})


## Create the directories to dump the files from AWS
shpDir <- path(homeDir, "pp-pipeline", "data", "shps")
csvDir <- path(homeDir, "pp-pipeline", "data", "csvs")
if (!dir.exists(shpDir)) {
  log_info(paste(shpDir, "does not exits.  Creating..."))
  dir_create(shpDir)
} else {
  log_info(paste(shpDir, "already exists. Skipping..."))
}
if (!dir.exists(csvDir)) {
  log_info(paste(csvDir, "does not exits.  Creating..."))
  dir_create(csvDir)
} else {
  log_info(paste(csvDir, "already exists. Skipping..."))
}

## get/read objects from bucket
log_info("Getting AWS CSV objects...")
csvObjs <-
  map(s3Csvs, function(x) {
    get_object(x, what = "raw", bucket = bucket)
  }) %>%
  set_names(s3Csvs)

walk(paste("Obtained CSV object", names(csvObjs)), log_info)

log_info("Getting AWS Shapefile objects...")
shpObjs <-
  map(s3Shpfiles, function(x) {
    get_object(x, what = "raw", bucket = bucket)
  }) %>%
  set_names(s3Shpfiles)

walk(paste("Obtained Shapefile object", names(shpObjs), "..."), log_info)


## read to local env and write the binary object to disk for persistent storage
csvList <- map(seq_along(csvObjs), function(i) {
  csv <-
    read_csv(
      rawToChar(csvObjs[[i]]),
      col_types = cols(
        propzip = col_character(),
        parcelno = col_character(),
        count = col_character()
      ),
      lazy = FALSE 
    )
  csvName <- basename(s3Csvs[[i]])
  log_info(paste("Writing", csvName, "to", csvDir, "..."))
  write_csv(csv, file.path(csvDir, csvName))
  return(csv)
}) %>%
  set_names(map(s3Csvs, basename) %>%
    str_replace("_edit.csv", ""))


shpList <- map(seq_along(shpObjs), function(i) {
  shpZipName <- basename(s3Shpfiles[[i]])
  shpName <- shpZipName %>% str_replace(".zip", "")

  log_info(paste("Writing", shpName, "to", shpDir, "..."))
  writeBin(shpObjs[[i]], file.path(shpDir, shpZipName))
  unzip(file.path(shpDir, shpZipName), exdir = shpDir)

  log_info(paste("Reading", shpName, "from", shpDir, "..."))
  shp <-
    st_read(file.path(shpDir, shpName), stringsAsFactors = FALSE)
  return(shp)
}) %>%
  set_names(map(s3Shpfiles, basename) %>%
    str_replace(".shp.zip", ""))


## clean up the global env
log_info("Cleaning up global environement...")
# gc(rm(
#   list = c(
#     "csvObjs",
#     "shpObjs",
#     "s3Csvs",
#     "s3Shpfiles",
#     "s3FileNames",
#     "ppBucket",
#     "getBucketNames"
#   )
# ))


## DETROIT DATA GEOJSON######
## Get zipcode data
for (i in 1:10) {
  skip_to_next <- FALSE

  tryCatch(
    {
      if (exists("zips")) {
        log_info(paste("Done fetching from", zipUrl))
        break
      } else {
        # TODO: What is ZIP_URL
        zipUrl <- Sys.getenv("ZIP_URL")
        log_info(paste("Fetching zipcode GeoJSON at", zipUrl))
        zips <- geojson_sf(zipUrl)
      }
    },
    error = function(e) {
      log_info(e)
      skip_to_next <<- TRUE
    },
    warning = function(w) {
      log_info(w)
      skip_to_next <<- TRUE
    }
  )

  if (skip_to_next) {
    log_info(paste("Atempt", i, "to fech zipcode GeoJSON..."))
    next
  }
}

################################
## TABLE CLEANING / PREP PHASE
################################

## DEFINE HELPER FUNCTIONS
## function to fix the differences in the names in each df
## any name standardization should go in this function
nameFixer <- function(df) {
  names(df)[names(df) == "id_old"] <- "old_id"
  names(df)[names(df) %in% c("taxpayer 1", "taxpayer_1", "taxpayer")] <-
    "taxpayer1"
  names(df)[names(df) %in% c("taxpayer 2", "taxpayer_2")] <-
    "taxpayer2"
  names(df)[names(df) == "cibyrbuilt"] <- "cityrbuilt"

  ## shp name changes
  names(df)[names(df) %in% c("parcelnumber", "parcel_num", "parcelnum")] <-
    "parcelno"
  names(df)[names(df) == "address"] <- "propaddr"
  names(df)[names(df) == "zipcode"] <- "propzip"

  names(df)[names(df) == "taxpayerstreet"] <- "tpaddr"
  names(df)[names(df) == "taxpayercity"] <- "tpcity"
  names(df)[names(df) == "taxpayerzip"] <- "tpzip"
  names(df)[names(df) == "taxpayerstate"] <- "tpstate"

  names(df)[names(df) == "yearbuilt"] <-
    "resyrbuilt" ## this may be wrong / ask Josh
  names(df)[names(df) == "totalsquarefootage"] <- "totsqft"
  names(df)[names(df) == "taxpayerstate"] <- "totacres"

  return(df)
}

## Cols to keep
ppCols <- c(
  "taxpayer1",
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
  ## adding these field
  ## provides no additional
  ## records
  "taxstatus",
  "saledate",
  "saleprice",
  "totsqft",
  "totacres",
  "cityrbuilt",
  "resyrbuilt"
)


## function to add in the year col to csvList
addYear <- function(i, dfs) {
  year <- names(dfs[i]) %>% str_split("_")
  year <- as.numeric(year[[1]][2])
  print(paste("Adding year column with", year, "to", names(dfs[i])))
  tmp_df <- dfs[[i]]
  if (is.numeric(year[[1]]) && !is.na(year[[1]])) {
    tmp_df$praxisyear <- year
  }

  return(tmp_df)
}

## function to fix parcel numbers that were truncated
parcelnoFixer <- function(df) {
  col <- df$parcelno

  ## add the period that was removed
  newCol <- map(col, function(val) {
    if (str_detect(val, fixed(".")) || str_detect(val, fixed("-"))) {
      return(val)
    } else {
      return(paste0(val, "."))
    }
  })


  ## add the zero that was removed
  zeroCol <- map(newCol, function(val) {
    if (nchar(val) == 8 && str_sub(val, start = -1, end = -1) == ".") {
      return(paste0("0", val))
    } else {
      return(val)
    }
  })
  df$parcelno <- unlist(zeroCol)
  return(df)
}

## some propno were not included
## this function adds it
propnoFixer <- function(df) {
  dfNames <- names(df)
  if (!"propno" %in% dfNames) {
    df$propno <- unlist(map(df$propstr, function(val) {
      valSplit <- val %>% str_split(" ")
      valSplitNo <- valSplit[[1]][[1]]

      if (!is.na(as.numeric(valSplitNo))) {
        return(as.double(valSplitNo))
      } else {
        return(NA)
      }
    }))
  }
  return(df)
}

## add zipcode based on zips geom rather than propzip
zipFixer <- function(shpDf, zipDf) {
  shpDf$temp_id <- 1:nrow(shpDf)

  shpCentroid <- shpDf %>%
    st_transform(3857) %>%
    st_centroid() %>%
    st_transform(4326)

  withDf <-
    st_join(st_as_sf(shpCentroid), zipDf["zipcode"])

  naDf <- withDf[is.na(withDf$zipcode), ] %>%
    select(-c(zipcode))
  withDf <- withDf[!is.na(withDf$zipcode), ]

  naDf <-
    st_join(st_as_sf(naDf), zipDf["zipcode"], join = st_nearest_feature)

  st_geometry(withDf) <- NULL
  st_geometry(naDf) <- NULL

  joinDf <-
    bind_rows(withDf, naDf) %>%
    arrange(temp_id)


  shpDf$zipcode_sj <- joinDf$zipcode
  shpDf <- shpDf[!is.na(shpDf$zipcode_sj), ]
  return(shpDf)
}

## RUN HELPER FUNCTIONS

## Clean the names in the shpList
walk(paste("Standardizing", names(shpList), "..."), log_info)
shpList <- map(shpList, nameFixer)

## Add the calculated zip code
walk(paste("Calulating zipcode from zips geometry", names(shpList), "..."), log_info)
shpList <- map(shpList, zipFixer, zipDf = zips)

## fix col names and add propno
walk(paste("Standardizing", names(csvList), "..."), log_info)
csvList <-
  map(csvList, nameFixer) %>%
  map(propnoFixer) %>%
  map(parcelnoFixer)

## add the year col
csvList <- map(seq_along(csvList), addYear, dfs = csvList)

## bind the df list for a full dataset
log_info(paste("Binding all CSVs and removing duplicates..."))
ppFull <- bind_rows(csvList)
ppFull <- ppFull[, ppCols]
ppFull <- ppFull[!duplicated(ppFull), ]

## cleanup env
log_info("Cleaning up global environement...")
# gc(rm(list = c("csvList")))

## CREATE TABLES
## 1. parcels_property
## 2. owner_taxpayer
## 3. parcel_property_geom
## 4. property
## 5. taxpayer
## 6. taxpayer_property
## 7. year
## 8. zips_geom

## parcels_property table
log_info("Creating parcels_property table...")
parPropCols <- c("parcelno", "propaddr") # PK
parProp <- ppFull[, parPropCols]
parProp <- parProp[!duplicated(parProp), ]
parProp$parprop_id <- paste("parprop", 1:nrow(parProp), sep = "-") ## 1st write

## add geometry to parProp
geomList <- map(seq_along(shpList), function(i) {
  walk(paste("Creating geometry table for", names(shpList[i]), "..."), log_info)
  shpName <- names(shpList[i])
  shp <- shpList[[shpName]][
    !is.na(shpList[[shpName]]$parcelno),
    c("parcelno", "propaddr", "zipcode_sj", "geometry")
  ]
  shp$tmp_id <- paste0(shp$parcelno, shp$propaddr)
  dupIds <- unique(shp$tmp_id[duplicated(shp$tmp_id)])
  dupShp <- shp[shp$tmp_id %in% dupIds, ]
  dupShp <- dupShp %>%
    group_by(parcelno, propaddr) %>%
    summarise(
      geometry = st_union(geometry),
      geom_agg_count = n(),
      zipcode_sj = toString(unique(zipcode_sj))
    )

  uniShp <- shp[!shp$tmp_id %in% dupIds, ]
  shp <- bind_rows(dupShp, uniShp)

  geom <- parProp %>%
    inner_join(shp, by = c("parcelno", "propaddr"))
  geom <-
    geom[, c(
      "parprop_id",
      "parcelno",
      "propaddr",
      "zipcode_sj",
      "geom_agg_count",
      "geometry"
    )]
  geom <- st_as_sf(geom[!duplicated(geom), ])
  st_crs(geom) <- 4326
  return(geom)
})

names(geomList) <-
  c(paste0("geom_", str_sub(
    names(shpList),
    start = -4, end = -1
  )))

geomList2 <- map(seq_along(geomList), function(i) {
  geomName <- names(geomList[i])
  walk(paste("Joining property praxis data to", geomName, "..."), log_info)
  geom <-
    geomList[[geomName]][, c("parprop_id", "zipcode_sj", "geometry")] %>%
    right_join(parProp, by = c("parprop_id"))
  names(geom)[names(geom) == "geometry"] <- geomName
  st_geometry(geom) <- geomName
  orderedGeom <- geom[order(geom$parprop_id), ]
  return(orderedGeom)
})


log_info("Creating parcel_property table...")
geomAll <- bind_cols(geomList2)

keepCols <-
  c(
    "parprop_id...1",
    "parcelno...4",
    "propaddr...5"
  )
zipCols <- names(geomAll)[str_detect(names(geomAll), "zipcode_sj")]
geomCols <- names(geomAll)[str_detect(names(geomAll), "geom")]

parPropGeom <- geomAll[, c(keepCols, geomCols)]

## helper function for when aggregating zips
uniqueZips <- function(x) {
  zip <- toString(unique(x[!is.na(x)]))
  return(zip)
}
zipDf <- geomAll[, zipCols]
st_geometry(zipDf) <- NULL
zipsAgg <- apply(zipDf, 1, uniqueZips)

names(parPropGeom) <-
  c("parprop_id", "parcelno", "propaddr", geomCols)

parPropGeom$zipcode_sj <- zipsAgg

#########################################
## remove the problem records
# removeRecords <- parPropGeom[nchar(parPropGeom$zipcode_sj)!=5,] ##write to disk?
#########################################


## property table
propCols <- c(
  "parcelno",
  "propaddr",
  "propno",
  "propdir",
  "propstr",
  "propzip"
)

prop <- ppFull[, propCols]
prop <- prop[!duplicated(prop), ]
prop$prop_id <- paste("prop", 1:nrow(prop), sep = "-")

prop <- parPropGeom %>%
  full_join(prop, by = c("parcelno" = "parcelno", "propaddr" = "propaddr"))
st_geometry(prop) <- NULL
prop <- prop[, c("prop_id", "parprop_id", propCols, "zipcode_sj")]


## owner_taxpayer table
log_info("Creating owner_taxpayer table...")
ownTaxCols <- c("taxpayer1", "own_id")
ownTax <- ppFull[, ownTaxCols]
ownTax <- ownTax[!duplicated(ownTax), ]
ownTax$owntax_id <- paste("owntax", 1:nrow(ownTax), sep = "-")

## taxpayer table
log_info("Creating taxpayer table...")
taxCols <- c(
  "own_id",
  "taxpayer1",
  "taxpayer2",
  "tpaddr",
  "tpcity",
  "tpstate",
  "tpzip",
  "taxstatus"
)
tax <- ppFull[, taxCols]
tax <- tax[!duplicated(tax), ]
tax$tp_id <- paste("tp", 1:nrow(tax), sep = "-")

## add owntax_id to tax table
tax <- ownTax %>% full_join(tax, by = c("own_id", "taxpayer1"))

## Create join ids
taxParPropCols <- c(
  "own_id",
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
taxParProp <- taxParProp[!duplicated(taxParProp), ]
taxParProp$taxparprop_id <-
  paste("tpp", 1:nrow(taxParProp), sep = "-")

## create new ids
taxParPropwIds <- taxParProp %>%
  full_join(
    tax,
    by = c(
      "own_id",
      "taxpayer1",
      "taxpayer2",
      "tpaddr",
      "tpcity",
      "tpstate",
      "tpzip",
      "taxstatus"
    )
  ) %>%
  full_join(prop,
    by = c(
      "parcelno",
      "propaddr",
      "propno",
      "propdir",
      "propstr",
      "propzip"
    )
  )

## remove redundant cols
taxPropCols <- c("tp_id", "prop_id", "taxparprop_id")
taxProp <- taxParPropwIds[, taxPropCols]
taxProp <- taxProp[!duplicated(taxProp), ]

## Back to Prop table
## remove redundant cols
prop <- prop[, c(
  "prop_id",
  "parprop_id",
  "propno",
  "propdir",
  "propstr",
  "propzip",
  "zipcode_sj"
)]

parPropGeom <-
  parPropGeom[, c(
    "parprop_id",
    "parcelno",
    "propaddr",
    "geom_2015",
    "geom_2016",
    "geom_2017",
    "geom_2018",
    "geom_2019",
    "geom_2020"
  )]

## Back to tax table
## remove redundant cols
tax <- tax[, c(
  "tp_id",
  "owntax_id",
  "taxpayer2",
  "tpaddr",
  "tpcity",
  "tpstate",
  "tpzip",
  "taxstatus"
)]


## Rejoin everything
taxParProp <- parPropGeom %>%
  full_join(prop, by = c("parprop_id")) %>%
  full_join(taxProp, by = c("prop_id")) %>%
  full_join(tax, by = c("tp_id")) %>%
  full_join(ownTax, by = c("owntax_id"))


## Year table prep build
log_info("Creating year table...")
yearCols <- c(
  "own_id",
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
  ## year cols below
  "saledate",
  "saleprice",
  "totsqft",
  "totacres",
  "cityrbuilt",
  "resyrbuilt",
  "praxisyear"
)
year <- ppFull[, yearCols]
year <- year[!duplicated(year), ]

## Join entire dataset to year
taxParPropYear <- taxParProp %>%
  full_join(
    year,
    by = c(
      "own_id",
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
  )

## remove redundant fields
year <- taxParPropYear[, c(
  "taxparprop_id",
  "saledate",
  "saleprice",
  "totsqft",
  "totacres",
  "cityrbuilt",
  "resyrbuilt",
  "praxisyear"
)] %>% 
  st_drop_geometry()

year <- year[!duplicated(year), ]

## create count column
## This can be joined to the full dataset
print("Creating count column...")
praxiscount <- taxParPropYear %>%
  st_drop_geometry() %>% 
  group_by(praxisyear, own_id) %>%
  summarise(count = sum(n()))

countGrouper <- function(val) {
  if (val > 9 & val <= 20) {
    return(1)
  } else if (val > 20 & val <= 100) {
    return(2)
  } else if (val > 100 & val <= 200) {
    return(3)
  } else if (val > 200 & val <= 500) {
    return(4)
  } else if (val > 500 & val <= 1000) {
    return(5)
  } else if (val > 1000 & val <= 1500) {
    return(6)
  } else if (val > 1500) {
    return(7)
  } else {
    return(0)
  }
}

## create the group col for filtering
praxiscount$group <- unlist(map(praxiscount$count, countGrouper))

## Remove intermediary tables from local env
log_info("Cleaning up global environement...")
# gc(rm(
#   list = c(
#     "taxParProp",
#     "taxParPropwIds",
#     "shpList",
#     "geomList",
#     "geomList2",
#     "taxParPropYear",
#     "ppFull",
#     "parProp"
#   )
# ))


#########################
## DB POPULATING PHASE
########################
## Create connection to DB
conn <- RPostgreSQL::dbConnect(
  "PostgreSQL",
  host = "postgres",
  dbname = Sys.getenv("DB_NAME"),
  user = Sys.getenv("DB_USER"),
  password = Sys.getenv("DB_PASSWORD")
)
## get PG version
dbGetQuery(conn, "SELECT version();")
# check that Post GIS is installed
pgPostGIS(conn)
pgListGeom(conn, geog = TRUE)


#### using the public schema
## Add geom tables
dbSendQuery(conn, "DROP TABLE IF EXISTS parcel_property_geom CASCADE;")
sf::st_write(parPropGeom, dsn = conn, layer = "parcel_property_geom")
dbSendQuery(conn, "DROP TABLE IF EXISTS zips_geom CASCADE;")
sf::st_write(zips, dsn = conn, layer = "zips_geom")

## Add regular tables
print("Creating PG table for property...")
if (RPostgreSQL::dbExistsTable(conn, "property")) {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS property CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "property", prop)
} else {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS property CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "property", prop)
}

print("Creating PG table for taxpayer_property...")
if (RPostgreSQL::dbExistsTable(conn, "taxpayer_property")) {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS taxpayer_property CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "taxpayer_property", taxProp)
} else {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS taxpayer_property CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "taxpayer_property", taxProp)
}

print("Creating PG table for year...")
if (RPostgreSQL::dbExistsTable(conn, "year")) {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS year CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "year", year)
} else {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS year CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "year", year)
}

print("Creating PG table for taxpayer...")
if (RPostgreSQL::dbExistsTable(conn, "taxpayer")) {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS taxpayer CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "taxpayer", tax)
} else {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS taxpayer CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "taxpayer", tax)
}

print("Creating PG table for owner_taxpayer...")
if (RPostgreSQL::dbExistsTable(conn, "owner_taxpayer")) {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS owner_taxpayer CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "owner_taxpayer", ownTax)
} else {
  RPostgreSQL::dbSendQuery(conn, "DROP TABLE IF EXISTS owner_taxpayer CASCADE;")
  RPostgreSQL::dbWriteTable(conn, "owner_taxpayer", ownTax)
}


## create PKs
dbSendQuery(
  conn,
  paste(
    "ALTER TABLE parcel_property_geom",
    "ADD CONSTRAINT parcel_property_pk",
    "PRIMARY KEY (parprop_id);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE property",
    "ADD CONSTRAINT property_pk",
    "PRIMARY KEY (prop_id);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE taxpayer_property",
    "ADD CONSTRAINT taxpayer_property_pk",
    "PRIMARY KEY (taxparprop_id);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE year",
    "ADD CONSTRAINT year_pk",
    "PRIMARY KEY (taxparprop_id, praxisyear);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE taxpayer",
    "ADD CONSTRAINT taxpayer_pk",
    "PRIMARY KEY (tp_id);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE owner_taxpayer",
    "ADD CONSTRAINT owner_taxpayer_pk",
    "PRIMARY KEY (owntax_id);"
  )
)


## create Fks
dbSendQuery(
  conn,
  paste(
    "ALTER TABLE property",
    "ADD CONSTRAINT property_fk FOREIGN KEY (parprop_id) REFERENCES parcel_property_geom (parprop_id);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE taxpayer_property",
    "ADD CONSTRAINT taxpayer_property_prop_fk FOREIGN KEY (prop_id) REFERENCES property (prop_id);"
  )
)
dbSendQuery(
  conn,
  paste(
    "ALTER TABLE taxpayer_property",
    "ADD CONSTRAINT taxpayer_property_tp_fk FOREIGN KEY (tp_id) REFERENCES taxpayer (tp_id);"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE year",
    "ADD CONSTRAINT year_fk FOREIGN KEY (taxparprop_id) REFERENCES taxpayer_property (taxparprop_id)"
  )
)

dbSendQuery(
  conn,
  paste(
    "ALTER TABLE taxpayer",
    "ADD CONSTRAINT taxpayer_fk FOREIGN KEY (owntax_id) REFERENCES owner_taxpayer (owntax_id)"
  )
)

createOwnerCount <- function() {
  print("Creating PG table for owner_count...")
  dbSendQuery(
    conn,
    paste(
      "DROP TABLE IF EXISTS owner_count;",
      "CREATE TABLE owner_count AS",
      "(SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) AS count",
      "FROM parcel_property_geom AS ppg",
      "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
      "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
      "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
      "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
      "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
      "GROUP BY y.praxisyear, ot.own_id)"
    )
  )

  dbSendQuery(
    conn,
    paste(
      "ALTER TABLE owner_count ADD COLUMN own_group INT;",
      "UPDATE owner_count",
      "SET own_group = 1",
      "WHERE count > 9 AND count <= 20;",
      "UPDATE owner_count",
      "SET own_group = 2",
      "WHERE count > 20 AND count <= 100;",
      "UPDATE owner_count",
      "SET own_group = 3",
      "WHERE count > 100 AND count <= 200;",
      "UPDATE owner_count",
      "SET own_group = 4",
      "WHERE count > 200 AND count <= 500;",
      "UPDATE owner_count",
      "SET own_group = 5",
      "WHERE count > 500 AND count <= 1000;",
      "UPDATE owner_count",
      "SET own_group = 6",
      "WHERE count > 1000 AND count <= 1500;",
      "UPDATE owner_count",
      "SET own_group = 7",
      "WHERE count > 1500;"
    )
  )
}

createOwnerCount()


## These need to be automated
createParcelGeomByYear <- function(years) {
  ## must be a list
  map(years, function(year) {
    print(paste0("Creating PG table for parcels_", year, "..."))
    dbSendQuery(
      conn,
      paste(
        "DROP TABLE IF EXISTS ",
        paste0("parcels_", year),
        "CASCADE;",
        "CREATE TABLE ",
        paste0("parcels_", year),
        "AS",
        "(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) AS feature_id, ",
        "y.saledate, y.saleprice, y.totsqft, y.totacres, y.cityrbuilt, y.resyrbuilt, ",
        "ppg.parprop_id, ppg.parcelno, ppg.propaddr, ",
        "ot.own_id, ot.taxpayer1, ",
        "count.count, ",
        "p.propno, p.propdir, p.propstr, p.propzip AS propzip2, p.zipcode_sj AS propzip, ",
        "ST_centroid(",
        paste0("ppg.geom_", year),
        ") AS centroid, ",
        paste0("ppg.geom_", year),
        "FROM parcel_property_geom AS ppg",
        "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
        "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
        "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
        "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
        "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
        "INNER JOIN (",
        "SELECT DISTINCT y.praxisyear, STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, ",
        "COUNT(ot.own_id) FROM parcel_property_geom AS ppg",
        "INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id",
        "INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id",
        "INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id",
        "INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id",
        "INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id",
        "GROUP BY y.praxisyear, ot.own_id)",
        "AS count ON y.praxisyear = count.praxisyear AND ot.own_id = count.own_id",
        "WHERE y.praxisyear",
        paste0("= ", year),
        "AND count.count > 9);"
      )
    )

    dbSendQuery(
      conn,
      paste(
        "ALTER TABLE ",
        paste0("parcels_", year),
        "ADD COLUMN own_group INT;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 1",
        "WHERE count > 9 AND count <= 20;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 2",
        "WHERE count > 20 AND count <= 100;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 3",
        "WHERE count > 100 AND count <= 200;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 4",
        "WHERE count > 200 AND count <= 500;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 5",
        "WHERE count > 500 AND count <= 1000;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 6",
        "WHERE count > 1000 AND count <= 1500;",
        "UPDATE ",
        paste0("parcels_", year),
        "SET own_group = 7",
        "WHERE count > 1500;"
      )
    )
  })
}
createParcelGeomByYear(yearList)
print("Done.")


