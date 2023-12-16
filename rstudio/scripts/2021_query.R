if (!require(pacman)) {
  install.packages("pacman")
}
library(pacman)
p_load(
  aws.s3, 
  rpostgis, 
  readr, 
  stringr, 
  dplyr, 
  sf, 
  geojsonsf, 
  dotenv, 
  fs, 
  purrr, 
  glue, 
  logger,
  tidyr)

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

##
cur_2021 <- 
  read_csv("./pp-pipeline/data/tmp/cur_data.csv")
new_2021 <- 
  read_csv("./pp-pipeline/data/tmp/new_2021_with_tp_address.csv")
new_2021_plus_ownid <- 
  read_csv("./pp-pipeline/data/tmp/NEW_2021_AKERS012622_117.csv") %>% 
  set_names(c("taxpayer_1", "n", "own_id1", "own_id2")) %>% 
  pivot_longer(cols = c("own_id1", "own_id2")) %>% 
  select(taxpayer_1, own_id = value) %>% 
  distinct()


new_2021_long_tp <- 
  new_2021_plus_ownid %>% 
  group_by(taxpayer_1) %>% 
  summarise(own_id = unique(na.omit(own_id)))



new_2021_long_tp2 <- 
  new_2021_plus_ownid %>% 
  filter(!taxpayer_1 %in% new_2021_long_tp$taxpayer_1) %>% 
  distinct() %>% 
  mutate(own_id = "UNKNOWN")


own_id_2021 <- 
  bind_rows(
  new_2021_long_tp,
  new_2021_long_tp2
) %>% 
  mutate(inc_years = "2021", 
         most_recent_year = 2021)

all_years <- 
  bind_rows(
  cur_2021 %>% 
    select(-n_years, taxpayer_1 = taxpayer1),
  own_id_2021 
)

parcels_2021 <- st_read("./pp-pipeline/data/tmp/2021_parcels/Parcels.shp")

final_2021 <- 
  parcels_2021 %>% 
  left_join(
    all_years,
    by="taxpayer_1"
  )

dotenv::load_dot_env(file = paste0(homeDir, "/pp-pipeline/scripts/rstudio.env"))

conn <- RPostgreSQL::dbConnect(
  "PostgreSQL",
  host = "postgres",
  dbname = "db",
  user = Sys.getenv("DB_USER"),
  password = Sys.getenv("DB_PASSWORD")
)

own_tax <- dbGetQuery(conn, "SELECT * FROM owner_taxpayer;")
tax <- dbGetQuery(conn, "SELECT * FROM taxpayer;")
tax_prop <- dbGetQuery(conn, "SELECT * FROM taxpayer_property;")
year <- dbGetQuery(conn, "SELECT * FROM year;")
property <- dbGetQuery(conn, "SELECT * FROM property")
par_prop <- st_read(conn, query="SELECT * FROM parcel_property_geom;")


# new_2021 <- read_csv("./pp-pipeline/data/tmp/NEW_2021.csv")
# names(new_2021) <- c("taxpayer_1", "n",  "taxpayer_2_2021", "taxpayer_3_2021")

all_join <- 
  own_tax %>% 
  left_join(
    new_2021,
    by = c("taxpayer1" = "taxpayer_1")
  ) %>%  
  inner_join(
    tax,
    by="owntax_id"
  ) %>% 
  inner_join(
    tax_prop,
    by="tp_id"
  ) %>% 
  inner_join(
    year,
    by="taxparprop_id"
  ) 

prev_join <- 
  all_join %>%
  select(
    taxpayer1,
    own_id
  ) %>% 
  distinct() %>% 
  mutate(status = "old")
  

parcels_2021_new <- 
  parcels_2021 %>% 
  filter(taxpayer_1 %in% prev_join$taxpayer1)

z <- x %>% 
  st_drop_geometry() %>% 
  select(taxpayer_1, o) %>% 
  distinct()
