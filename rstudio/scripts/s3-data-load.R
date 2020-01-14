options(stringsAsFactors = FALSE)
if(!require(aws.s3)) install.packages("aws.s3") 
if(!require(rpostgis)) install.packages("rpostgis")
if(!require(readr)) install.packages("readr")
if(!require(stringr)) install.packages("stringr")
if(!require(sf)) install.packages("sf")
if(!require(dotenv)) install.packages("dotenv")
if(!require(pacman)) install.packages("pacman"); library(pacman)
p_load(aws.s3, rpostgis, readr, stringr, sf, dotenv)

##Load env vars
home_dir <- try(system("echo $HOME", intern = TRUE))
##docker specific logic for running docker exec
if(home_dir=="/root") home_dir <- "/home/rstudio"
dotenv::load_dot_env(file = paste0(home_dir, "/pp-pipeline/scripts/rstudio.env"))

##Donwload all relevant S3 data to populate DB
##Note if there is a 403 error, you may need to docker-compose up --build
ppBucket <- get_bucket("property-praxis")

getBucketNames <- function(x){
  return(x[[1]][1])
}

##Get file names and separate into different lists
s3FileNames <- lapply(ppBucket, getBucketNames)
csvs <- s3FileNames[str_detect(s3FileNames, ".csv")]
shpFiles <- s3FileNames[str_detect(s3FileNames, "shp.zip")]

##Create the directory to dump the files from aws



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

# Sys.setenv("AWS_ACCESS_KEY_ID" = "AKIA2XGYZ6B4KUIYQVQP",
# "AWS_SECRET_ACCESS_KEY" = "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",
# "AWS_DEFAULT_REGION" = "us-west-2")

##testing for csvs
bucket <- get_bucket("property-praxis")
rawCsv <- get_object("PPlusFinal_2016.csv", bucket = "property-praxis")
#note it is important to set the coltypes to avaoid errors when parsing
csv <- read_csv(rawToChar(rawCsv), col_types = cols(propzip=col_character()))

##testing for shapefiles
rawShpZip <- get_object("Praxis Shapefiles/praxis2016.shp.zip", bucket = "property-praxis", what="raw", n=1e6)

tmp <- tempfile()
writeBin(rawShpZip, tmp)
tmp <- unzip(tmp, exdir=tempdir())
shp <- st_read("/tmp/Rtmprwn3Hy/praxis2016.shp/praxis2016.shp")
unlink(tmp)
#x <- readBin(rawShpZip, character(), n=length(rawShpZip))

##or in a reg dir
writeBin(rawShpZip, "test.zip")
test <- unzip("test.zip", exdir="/home/rstudio")
# temp <- tempfile(rawShpZip)
# unzip(rawShpZ)

# x <- readBin(raxShpZip, what="raw") 
# base64_dec(rawShpZip)
##testing for zips