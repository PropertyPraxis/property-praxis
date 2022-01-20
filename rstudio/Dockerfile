FROM rocker/geospatial:latest

RUN mkdir -p /home/rstudio/pp-pipeline/scripts \
    mkdir -p /home/rstudio/pp-pipeline/data

## install ODBC drivers
RUN apt-get update \
 && apt-get install --yes --no-install-recommends \
    unixodbc unixodbc-dev odbc-postgresql libssl-dev \
    tzdata

RUN install2.r --error \
    devtools \
    dotenv \
    odbc \
    rpostgis \
    geojsonsf \
    pacman