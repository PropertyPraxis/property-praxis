// function to find the single target address at distance 0
function findTargetAddress(features) {
  const targetAddress = features
    .map(feature => {
      if (feature.properties.distance === 0) {
        return feature;
      }
      return null;
    })
    .filter(result => result !== null);

  const nearbyAddresses = features
    .map(feature => {
      if (feature.properties.distance !== 0) {
        return feature;
      }
      return null;
    })
    .filter(result => result !== null);

  console.log(targetAddress);
  return { targetAddress, nearbyAddresses };
}

function buildGeoJSONTemplate(features) {
  const template = {
    type: "FeatureCollection",
    features: features
  };
  return JSON.stringify(template);
}

module.exports = { findTargetAddress, buildGeoJSONTemplate };
