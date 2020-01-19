options(stringsAsFactors = FALSE)

if(!require(readr)) install.packages("readr")
if(!require(dplyr)) install.packages("dplyr")
if(!require(sf)) install.packages("sf")
if(!require(httr)) install.packages("httr")
if(!require(dplyr)) install.packages("dplyr")
if(!require(stringr)) install.packages("stringr")
if(!require(purr)) install.packages("purrr")
if(!require(dotenv))install.packages("dotenv")
if(!require(pacman)) install.packages("pacman"); library(pacman)
p_load(readr, dplyr, sf, geojsonio, httr, dplyr, stringr, purrr, dotenv)

##load env
home_dir <- try(system("echo $HOME", intern = TRUE))
##docker specific logic for running docker exec
if(home_dir=="/root") home_dir <- "/home/rstudio"
dotenv::load_dot_env(file = paste0(home_dir, "/pp-pipeline/scripts/rstudio.env"))

##READ IN BOX FILES
##still need to figure out api
##SHAPEFILES
##read in shapfiles to list
# IN_DATA_DIR="/home/rstudio/pp-pipeline/data/Property Praxis Data MAC"
# IN_SHP_DIR="/home/rstudio/pp-pipeline/data/Property Praxis Data MAC/Praxis Shapefiles"
in_shp_dir <- Sys.getenv("IN_SHP_DIR")
shps_zip <- list.files(in_shp_dir, pattern="*zip", full.names = TRUE)

pp_shps <- lapply(shps_zip, function(shp){
  unzip(shp, exdir = dirname(shp))
  shp_name <- basename(shp) %>% str_replace(fixed(".zip"), "")
  pp_shp <- st_read(file.path(in_shp_dir, shp_name))
  return(pp_shp)
})

names(pp_shps) <- basename(shps_zip ) %>% 
  str_replace(fixed(".shp.zip"), "")

####testing shps
x <- pp_shps[[1]]
x <- x[!is.na(x$parcelno), ]
dim(x)
####


####CSVS
##read in csv data from local dir
in_data_dir = Sys.getenv("IN_DATA_DIR")
csvs <- list.files(in_data_dir, pattern = "*.csv", full.names = TRUE)

##function to fix the differences in the names in each df
##any of the name chages should go in this fucntion
nameFixer <- function(df){
  names(df)[names(df) == "id_old"] <- "old_id"
  names(df)[names(df) == "taxpayer 2"] <- "taxpayer2"
  return(df)
}

pp_dfs <- lapply(csvs, function(csv){
  local_var_name <- str_replace(csv, fixed(".csv"), "")
  df <- read_csv(csv)
  assign(local_var_name, df)
}) %>% lapply(nameFixer)

##name the dfs
csv_names <- list.files(in_data_dir, pattern = "*.csv") %>% 
  str_replace(fixed(".csv"), "") 
names(pp_dfs) <- csv_names

##function to add in the year
addYear <- function(i, dfs){
  year <- names(dfs[i]) %>% str_split("_")
  year <- as.numeric(year[[1]][2])
  tmp_df <- dfs[[i]]
  if(is.numeric(year[[1]]) && !is.na(year[[1]])){
    tmp_df$year <- year
  }
  
  return(tmp_df)
}

pp_dfs <- lapply(seq_along(pp_dfs), addYear, dfs=pp_dfs)
names(pp_dfs) <- csv_names

##bind the df list for a full dataset
pp_full <- bind_rows(pp_dfs[1:3])
pp_full$full_id <- paste(pp_full$id, pp_full$year, sep = "-")



##TESITNG ON FULL DATASET
##########TESTING BELOW
names(pp_full)
dim(pp_full)
length(unique(pp_full$full_id))
##TABLES
##1. Parcel/Property
##2. Owner/taxpayer

##parcels
#c("parcelno", "propaddr", "propno", "propdir", "propstr", "propzip")
parcels <- c("parcelno", "propaddr") #PK
pp_full_parcels <- pp_full[,parcels]
pp_full_parcels <- pp_full_parcels[!duplicated(pp_full_parcels),]
dim(pp_full_parcels)
length(unique(pp_full_parcels$parcelno))
length(unique(pp_full_parcels$propaddr))
pp_full_parcels$parprop_id <- paste("parprop", 1:nrow(pp_full_parcels), sep="-")

#property table
par_prop <- c("parcelno", "propaddr", "propno", "propdir", "propstr", "propzip") 
pp_par_prop <- pp_full[,par_prop]
pp_par_prop <- pp_par_prop[!duplicated(pp_par_prop),]
dim(pp_par_prop)
length(unique(pp_par_prop$parcelno))
length(unique(pp_par_prop$propaddr))
pp_par_prop$prop_id <- paste("prop", 1:nrow(pp_par_prop), sep="-")

##by year build
par_year <- c("parcelno", "propaddr", "propno", "propdir", "propstr", "propzip", "year")
pp_par_year <- pp_full[,par_year]
pp_par_year <- pp_par_year[!duplicated(pp_par_year),]
dim(pp_par_year)
length(unique(pp_par_year$parcelno))
length(unique(pp_par_year$propaddr))

##test joins
pp_prop_year_joined <- pp_full_parcels %>% 
  full_join(pp_par_prop, by=c("propaddr"="propaddr", "parcelno"="parcelno")) %>%
  full_join(pp_par_year, by=c("parcelno"="parcelno",
                              "propaddr"="propaddr",
                              "propno"="propno",
                              "propdir"="propdir",
                              "propstr"="propstr",
                              "propzip"="propzip"))
dim(pp)

##year table
year <- c("prop_id", "year")
pp_year <- pp_year[,year]
pp_year <- pp_year[!duplicated(pp_year),]


##taxpayer table
own_tax <- c("taxpayer1", "taxpayer2", "tpaddr", "tpcity", "tpstate", "tpzip")
pp_own_tax <- pp_full[,own_tax]
pp_own_tax <- pp_own_tax[!duplicated(pp_own_tax),]
dim(pp_own_tax)
pp_own_tax$tax_id <- paste("tax", 1:nrow(pp_own_tax), sep="-")

##tax own build
prop_tax <- c("taxpayer1", "taxpayer2", "tpaddr", "tpcity", "tpstate", "tpzip", "own_id")
pp_prop_tax <- pp_full[,prop_tax]
pp_prop_tax <- pp_prop_tax[!duplicated(pp_prop_tax),]
dim(pp_prop_tax)


##join test
pp_tax_own_joined <- pp_own_tax %>% 
  full_join(pp_prop_tax, by=c("taxpayer1"="taxpayer1", 
                              "taxpayer2"="taxpayer2", 
                              "tpaddr"="tpaddr", 
                              "tpcity"="tpcity", 
                              "tpstate"="tpstate",
                              "tpzip"="tpzip"))

##tax_own table
tax_own <- c("tax_id", "own_id")
pp_tax_own <- pp_tax_own_joined[,tax_own]
pp_tax_own <- pp_tax_own[!duplicated(pp_tax_own),]



##build main join tables
par_all <- c("taxpayer1", 
             "taxpayer2", 
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
             ##adding these field 
             ##provides no additional 
             ##records
             # "taxstatus",
             # "saledate", 
             # "saleprice",
             # "totsqft",
             # "totacres",
             # "cibyrbuilt",
             # "resyrbuilt",
             # "latitude",
             # "longitude",
             # "location"
             )
pp_all_join <- pp_full[,par_all]
pp_all_join <- pp_all_join[!duplicated(pp_all_join),]
dim(pp_all_join)
length(unique(pp_all_join$taxpayer1))

##remaining questions
# Where will the geomery column go?
# which fileds will be kep
# Determine how count is generated

##############################################################
#############
####


own <- c("own_id", "taxpayer1", "taxpayer2", "tpaddr", "tpcity", "tpstate", "tpzip")
pp_own <- pp_full[,own]
pp_own <- pp_own[!duplicated(pp_own),]
dim(pp_own)
length(unique(pp_own$taxpayer1))



##taxpayer details
tax_own_all <- c("own_id", "taxpayer1", "taxpayer2", "tpaddr", "tpcity", "tpstate", "tpzip")
pp_tax_own_all <- pp_full[,tax_own_all]
pp_tax_own_all <- pp_tax_own_all[!duplicated(pp_tax_own_all),]
dim(pp_tax_own_all)
length(unique(pp_tax_own_all$taxpayer1))
length(unique(pp_tax_own_all$own_id))



length(unique(pp_full$own_id))
own_sub_full <- pp_full[,c("own_id", "count", "own_type")]
own_sub_full <- own_sub_full[!duplicated(own_sub_full),]  
dim(own_sub_full)  

##taxpayer ownid table join table?
length(unique(pp_full$own_id))
length(unique(pp_full$taxpayer1))
tp_sub_full_join <- pp_full[,c("taxpayer1", "own_id")]
tp_sub_full_join <- tp_sub_full_join[!duplicated(tp_sub_full_join),]  
dim(tp_sub_full_join)   

##taxpayer table
length(unique(pp_full$taxpayer1))
tp_sub_full <- pp_full[, c("taxpayer1")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tp_sub_full <- tp_sub_full[!duplicated(tp_sub_full),]  
dim(tp_sub_full)  


##
# length(unique(pp_full$"taxpayer1"))
tpaddr_sub_full <- pp_full[, c("tpaddr", "tpcity", "tpstate",  "tpzip")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tpaddr_sub_full <- tpaddr_sub_full[!duplicated(tpaddr_sub_full),]  
dim(tpaddr_sub_full)
x <- tpaddr_sub_full[duplicated(tpaddr_sub_full$tpaddr),] 

##OR ALL TOGETHER
length(unique(pp_full$"taxpayer1"))
tpaddr_sub_full <- pp_full[, c( "taxpayer1","taxpayer2", "tpaddr", "tpaddr", "tpcity", "tpstate",  "tpzip")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tpaddr_sub_full <- tpaddr_sub_full[!duplicated(tpaddr_sub_full),]  
dim(tpaddr_sub_full)
x <- tpaddr_sub_full[duplicated(tpaddr_sub_full$tpaddr),] 

#####
##parcels
##c("parcelno", "propaddr", "propno", "propdir", "propstr", "propzip", "ward", "fa")
length(unique(pp_full$propaddr))
prop_sub_full <- pp_full[,c("parcelno","propaddr", "propno", "propdir", "propstr", "fa")]
prop_sub_full <- prop_sub_full[!duplicated(prop_sub_full),]
dim(prop_sub_full)

##zipcode join
length(unique(pp_full$propaddr))
zip_sub_full <- pp_full[,c("propaddr", "propzip", "ward")]
zip_sub_full <- zip_sub_full[!duplicated(zip_sub_full),]
dim(zip_sub_full)

##testing
#"propaddr", "parcelno" ARE A PK as NK
length(unique(pp_full$parcelno))
sub_full <- pp_full[,c("propaddr", "parcelno", "old_id")]
sub_full <- sub_full[!duplicated(sub_full),]
dim(sub_full)
x <- sub_full[duplicated(sub_full$propaddr),]

#############################
#############################

##check names
names(pp_dfs[[1]])[!names(pp_dfs[[1]]) %in% names(pp_dfs[[2]])]
names(pp_dfs[[1]])[!names(pp_dfs[[1]]) %in% names(pp_dfs[[3]])]
names(pp_dfs[[2]])[!names(pp_dfs[[2]]) %in% names(pp_dfs[[1]])]
names(pp_dfs[[2]])[!names(pp_dfs[[2]]) %in% names(pp_dfs[[3]])]
names(pp_dfs[[3]])[!names(pp_dfs[[3]]) %in% names(pp_dfs[[1]])]
names(pp_dfs[[3]])[!names(pp_dfs[[3]]) %in% names(pp_dfs[[2]])]
##PP_full
pp_full <- pp_dfs$PPlusFinal_20_full
pp_full <- pp_full %>% group_by_all() %>% summarise(sum_count = n())

names(pp_full)
length(unique(pp_full$id))

# c("taxpayer1", "taxpayer2", "own_type", "own_id",
#   "count",   "tpaddr",   "tpcity", "tpstate",  "tpzip")

##owner table UNIQUE
length(unique(pp_full$own_id))
own_sub_full <- pp_full[,c("own_id", "count", "own_type")]
own_sub_full <- own_sub_full[!duplicated(own_sub_full),]  
dim(own_sub_full)  

##own id alone
length(unique(pp_full$own_id))
own_full <- pp_full[,c("own_id")]
own_full <- own_full[!duplicated(own_full),]  
dim(own_full)  

##taxpayer ownid table join table?
length(unique(pp_full$own_id))
length(unique(pp_full$taxpayer1))
tp_sub_full_join <- pp_full[,c("taxpayer1", "own_id")]
tp_sub_full_join <- tp_sub_full_join[!duplicated(tp_sub_full_join),]  
dim(tp_sub_full_join)   

##taxpayer table
length(unique(pp_full$taxpayer1))
tp_sub_full <- pp_full[, c("taxpayer1")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tp_sub_full <- tp_sub_full[!duplicated(tp_sub_full),]  
dim(tp_sub_full)  


##
# length(unique(pp_full$"taxpayer1"))
tpaddr_sub_full <- pp_full[, c("tpaddr", "tpcity", "tpstate",  "tpzip")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tpaddr_sub_full <- tpaddr_sub_full[!duplicated(tpaddr_sub_full),]  
dim(tpaddr_sub_full)
x <- tpaddr_sub_full[duplicated(tpaddr_sub_full$tpaddr),] 

##OR ALL TOGETHER
length(unique(pp_full$"taxpayer1"))
tpaddr_sub_full <- pp_full[, c( "taxpayer1","taxpayer2", "tpaddr", "tpaddr", "tpcity", "tpstate",  "tpzip")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tpaddr_sub_full <- tpaddr_sub_full[!duplicated(tpaddr_sub_full),]  
dim(tpaddr_sub_full)
x <- tpaddr_sub_full[duplicated(tpaddr_sub_full$tpaddr),] 

#####
##parcels
##c("parcelno", "propaddr", "propno", "propdir", "propstr", "propzip", "ward", "fa")
length(unique(pp_full$propaddr))
prop_sub_full <- pp_full[,c("parcelno","propaddr", "propno", "propdir", "propstr", "fa")]
prop_sub_full <- prop_sub_full[!duplicated(prop_sub_full),]
dim(prop_sub_full)

##zipcode join
length(unique(pp_full$propaddr))
zip_sub_full <- pp_full[,c("propaddr", "propzip", "ward")]
zip_sub_full <- zip_sub_full[!duplicated(zip_sub_full),]
dim(zip_sub_full)

##testing
#"propaddr", "parcelno" ARE A PK as NK
length(unique(pp_full$parcelno))
sub_full <- pp_full[,c("propaddr", "parcelno", "old_id")]
sub_full <- sub_full[!duplicated(sub_full),]
dim(sub_full)
x <- sub_full[duplicated(sub_full$propaddr),]

###############################################################################
##########
##########
##PP16
##"own_type" removed in this year
pp16 <- pp_dfs$PPlusFinal_2016
pp16 <- pp16 %>% group_by_all() %>% summarise(sum_count = n())

names(pp16)
length(unique(pp16$id))

# c("taxpayer1", "taxpayer2", "own_type", "own_id",
#   "count",   "tpaddr",   "tpcity", "tpstate",  "tpzip")

##owner table UNIQUE
length(unique(pp16$own_id))
own_sub16 <- pp16[,c("own_id", "count")]##count is fucked up here
own_sub16 <- own_sub16[!duplicated(own_sub16),]  
dim(own_sub16)  
x <- own_sub16[duplicated(own_sub16$own_id), ]##Look at steve hagerman and mike litch
x <- pp16[(pp16$own_id %in% x$own_id),]



##taxpayer ownid table join table?
length(unique(pp16$own_id))
length(unique(pp16$taxpayer1))
tp_sub16_join <- pp16[,c("taxpayer1", "own_id")]
tp_sub16_join <- tp_sub16_join[!duplicated(tp_sub16_join),]  
dim(tp_sub16_join)   
x <- tp_sub16_join[duplicated(tp_sub16_join$taxpayer1),]

##taxpayer table
length(unique(pp16$taxpayer1))
tp_sub16 <- pp16[, c("taxpayer1")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tp_sub16 <- tp_sub16[!duplicated(tp_sub16),]  
dim(tp_sub16)  


##
# length(unique(pp16$"taxpayer1"))

tpaddr_sub16 <- pp16[, c("tpaddr", "tpcity", "tpstate",  "tpzip")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tpaddr_sub16 <- tpaddr_sub16[!duplicated(tpaddr_sub16),]  
dim(tpaddr_sub16)
x <- tpaddr_sub16[duplicated(tpaddr_sub16$tpaddr),] 

##OR ALL TOGETHER
length(unique(pp16$"taxpayer1"))
tpaddr_sub16 <- pp16[, c( "taxpayer1","taxpayer 2", "tpaddr", "tpaddr", "tpcity", "tpstate",  "tpzip")] #"tpaddr",   "tpcity", "tpstate",  "tpzip"
tpaddr_sub16 <- tpaddr_sub16[!duplicated(tpaddr_sub16),]  
dim(tpaddr_sub16)
x <- tpaddr_sub16[duplicated(tpaddr_sub16$tpaddr),] 

#####
##parcels
##c("parcelno", "propaddr", "propno", "propdir", "propstr", "propzip", "ward", "fa")
length(unique(pp16$propaddr))
prop_sub16 <- pp16[,c("parcelno","propaddr", "propno", "propdir", "propstr", "fa")]
prop_sub16 <- prop_sub16[!duplicated(prop_sub16),]
dim(prop_sub16)

##zipcode join
length(unique(pp16$propaddr))
zip_sub16 <- pp16[,c("propaddr", "propzip", "ward")]
zip_sub16 <- zip_sub16[!duplicated(zip_sub16),]
dim(zip_sub16)

##testing
#"propaddr", "parcelno" ARE A PK as NK
length(unique(pp16$parcelno))
sub16 <- pp16[,c("propaddr", "parcelno", "id_old")]
sub16 <- sub16[!duplicated(sub16),]
dim(sub16)
x <- sub16[duplicated(sub16$propaddr),]
