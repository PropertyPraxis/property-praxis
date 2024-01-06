import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { handleGetViewerPosition } from "../../actions/search"
// import { calculateDesiredBearing, bearingToBasic } from "../../utils/viewer";
import { Viewer, SimpleMarker } from "mapillary-js"
import * as turf from "@turf/turf"

// test images
// 1456011628085234
// 158792956297878
// 490232582209226
// 911499166077898
// 1986938741445478
// working on refresh
// http://localhost:3000/map?type=address&place=17315%20Fenton&coordinates=%257B%2522longitude%2522%3A-83.28279195454097%2C%2522latitude%2522%3A42.41714576967229%257D&year=2020

// const ORG_KEY = "NZ8NFgreZHnVBmPwrtGYEA"; // city of detroit
// const ORG_KEY = "codegis";
const access_token = "MLY|4790260297730810|2c2446b85cd5a589a6e1cd43aa3b3525"

function createMarker(markerId, lngLat, color) {
  const marker = new SimpleMarker(markerId, lngLat, {
    ballColor: "red",
    ballOpacity: 0.9,
    color,
    opacity: 0.5,
    interactive: true,
  })
  return marker
}

function useImageKey({ searchCoordinates, searchYears, searchYear }) {
  const [imageProps, setSelectedImage] = useState(null)

  // create buffer search distance
  const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates))
  const point = turf.point([longitude, latitude])
  const buffered = turf.buffer(point, 150, { units: "meters" })
  const bbox = turf.bbox(buffered)

  // calculate start and end for searching
  const allSearchYears = searchYears
    .map((year) => Number(year.praxisyear))
    .sort()

  // create ISO strings
  const start_captured_at = new Date(allSearchYears[0], 0, 1).toISOString()
  const end_captured_at = new Date(
    allSearchYears[allSearchYears.length - 1],
    11,
    31
  ).toISOString()

  const organization_id = 518073312556755 //TODO: put this somewhere else
  const fields = "id,geometry,captured_at,compass_angle,computed_rotation"
  const limit = 150

  // API params
  const params = new URLSearchParams({
    access_token,
    bbox,
    organization_id,
    fields,
    start_captured_at,
    end_captured_at,
    limit,
  }).toString()

  useEffect(() => {
    ;(async () => {
      const query = `https://graph.mapillary.com/images?${params}`

      const res = await fetch(query)
      const json = await res.json()

      const selectedImage = json.data
        .map((item) => {
          const searchPoint = turf.point([longitude, latitude])
          const viewerPoint = turf.point([
            item.geometry.coordinates[0],
            item.geometry.coordinates[1],
          ])

          // calculate distance for starting image
          const distance = turf.distance(searchPoint, viewerPoint)
          item.distance = distance
          return item
        })
        .sort((a, b) => {
          return a.distance - b.distance
        })[0]

      setSelectedImage(selectedImage)
    })()
    return () => null
  }, [searchCoordinates])

  return { imageProps }
}

function MapViewerV4({ searchState }) {
  const { searchCoordinates, searchTerm, searchYear } = searchState.searchParams
  const { searchYears } = searchState.searchBar
  const { imageProps } = useImageKey({
    searchCoordinates,
    searchYears,
    searchYear,
  })
  const dispatch = useDispatch()

  useEffect(() => {
    if (imageProps && searchCoordinates) {
      const componentOptions = {
        cover: false,
        marker: true,
      }

      let viewer = new Viewer({
        accessToken: access_token,
        container: "mly",
        component: componentOptions,
      })

      const coords = JSON.parse(decodeURIComponent(searchCoordinates))
      const markerComponent = viewer.getComponent("marker")
      markerComponent.add([
        createMarker(
          searchTerm,
          { lat: coords.latitude, lng: coords.longitude },
          "red"
        ),
      ])

      // veiwer handlers here
      viewer.moveTo(imageProps.id).catch((error) => console.warn(error))
      const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates))

      // set the center to the marker
      const createBasicCoords = async () => {
        const pixelPoint = await viewer.project({
          lat: latitude,
          lng: longitude,
        })
        const basicPoint = await viewer.unprojectToBasic(pixelPoint)

        // only use centerX
        viewer.setCenter([basicPoint[0], 0.5])
      }
      createBasicCoords()

      // event handlers
      const onPovChange = async () => {
        const pov = await viewer.getPointOfView()
        dispatch(
          handleGetViewerPosition({
            bearing: pov.bearing,
          })
        )
      }

      const onPositionChange = async () => {
        const position = await viewer.getPosition()
        dispatch(
          handleGetViewerPosition({
            lat: position.lat,
            lng: position.lng,
          })
        )
      }

      // viewer events
      viewer.on("pov", () => {
        onPovChange()
      })

      viewer.on("position", () => {
        onPositionChange()
      })
    }

    return () => {
      // clean up
      dispatch(
        handleGetViewerPosition({
          lat: null,
          lng: null,
          bearing: null,
        })
      )
    }
  }, [imageProps, searchCoordinates])
  return <div className="map-viewer" id="mly"></div>
}

export default MapViewerV4
