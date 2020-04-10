FROM rocker/geospatial:latest

RUN mkdir -p /home/rstudio/pp-pipeline/scripts \
    mkdir -p /home/rstudio/pp-pipeline/data

##install ODBC drivers
RUN apt-get update \
 && apt-get install --yes --no-install-recommends \
    unixodbc unixodbc-dev odbc-postgresql libssl-dev \
    tzdata
###


RUN install2.r --error \
    devtools \
    dotenv \
    #boxr \
    odbc \
    #RPostgres \
    rpostgis \
    geojsonsf \
    pacman
    
RUN R -e "install.packages('aws.s3', repos = c('cloudyr' = 'http://cloudyr.github.io/drat'))" \
    R -e "devtools::install_github('yonghah/esri2sf')"

RUN echo "uiPrefs={\"theme\" : \"Solarized Dark\"}" >> \
  /home/rstudio/.rstudio/monitored/user-settings/user-settings