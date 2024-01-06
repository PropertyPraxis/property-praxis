// function to find the single target address
// at distance 0 and nearby addresses
function findTargetAddress(features) {
  if (features) {
    const targetAddress = features
      .map((feature) => {
        if (feature.properties.distance === 0) {
          return feature
        }
        return null
      })
      .filter((result) => result !== null)

    const nearbyAddresses = features
      .map((feature) => {
        if (feature.properties.distance !== 0) {
          return feature
        }
        return null
      })
      .filter((result) => result !== null)

    return { targetAddress, nearbyAddresses }
  }

  return {
    targetAddress: [],
    nearbyAddresses: [],
  }
}

function buildGeoJSONTemplate(features) {
  const template = {
    type: "FeatureCollection",
    features: features,
  }
  return template
}

function isGeoJSONEmpty(geoJSON) {
  if (geoJSON.features === null || geoJSON.features.length === 0) {
    return true
  } else {
    return false
  }
}

function checkEmptyGeoJSON(geoJSON) {
  if (isGeoJSONEmpty(geoJSON)) {
    return buildGeoJSONTemplate([])
  } else {
    return geoJSON
  }
}

module.exports = {
  findTargetAddress,
  buildGeoJSONTemplate,
  isGeoJSONEmpty,
  checkEmptyGeoJSON,
}
