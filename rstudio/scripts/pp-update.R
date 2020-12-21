##Get parcel data
# for (i in 1:10) {
#   skip_to_next <- FALSE
#
#   tryCatch({
#     if (exists("gj")) {
#       print(paste("Done fetching from", gjUrl, "..."))
#       break
#     } else {
#       gjUrl <- Sys.getenv("PARCELS_URL")
#       print(paste("Fetching parcel GeoJSON at", gjUrl, "..."))
#       gj <- geojson_sf(gjUrl)
#     }
#
#   }, error = function(e) {
#     print(e)
#     skip_to_next <<- TRUE
#   }, warning = function(w) {
#     print(w)
#     skip_to_next <<- TRUE
#   })
#
#   if (skip_to_next) {
#     print(paste("Atempt", i, "to fech parcels GeoJSON..."))
#     next
#   }
# }
