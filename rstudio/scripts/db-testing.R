install.packages("RPostgres")

library(DBI)
# Connect to a specific postgres database i.e. Heroku
con <- dbConnect(RPostgres::Postgres(),dbname = 'db', 
                 host = 'postgres', # i.e. 'ec2-54-83-201-96.compute-1.amazonaws.com'
                 port = 5432, # or any other port specified by your DBA
                 user = 'user',
                 password = 'pass',
                 connection_tab = TRUE)

temp <- dbGetQuery(con, 'SELECT version();')
