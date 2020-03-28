//logic to render mobile properly

export function setDocHeightOnWindow() {
  function setDocHeight() {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight / 100}px`
    );
  }
  window.addEventListener("resize", function() {
    setDocHeight();
  });
  window.addEventListener("orientationchange", function() {
    setDocHeight();
  });

  setDocHeight();
}

export function capitalizeFirstLetter(string) {
  if (string === null) return null;
  const lowerString = string.toLowerCase();
  const strArray = lowerString.split(" ");
  const capitalizedStrArray = strArray.map(val => {
    return val.charAt(0).toUpperCase() + val.slice(1);
  });

  return capitalizedStrArray.join(" ");
}

export function pathnameToSearchType(path) {
  switch (path) {
    case "/address":
      return "Address";
    case "/zipcode":
      return "Zipcode";
    case "/speculator":
      return "Speculator";
    case "/all":
      return "All";
    default:
      return "All";
  }
}
//function to build filter
// export function createParcelLayerFilter(val){

// }

// function to find the single target address at distance 0
export function findTargetAddress(features) {
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

  return { targetAddress, nearbyAddresses };
}

export function createAddressString(propno, propdir, propstr, propzip) {
  const addressString = `${propno} ${
    propdir !== "0" && propdir !== null && propdir !== "null" ? propdir : ""
  } ${propstr}${
    propzip !== "0" && propzip !== null && propzip !== "null"
      ? ", " + propzip
      : ""
  }`;

  return addressString;
}

export function createLayerFilter(arr) {
  let layerFilter = [];

  const fullFilter = arr.map(item => {
    if (item === "10-20") {
      return [...layerFilter, ...[["==", "own_group", 1]]];
    }
    if (item == "100") {
      return [...layerFilter, ...[["==", "own_group", 2]]];
    }
    if (item == "200") {
      return [...layerFilter, ...[["==", "own_group", 3]]];
    }
    if (item == "500") {
      return [...layerFilter, ...[["==", "own_group", 4]]];
    }
    if (item == "1000") {
      return [...layerFilter, ...[["==", "own_group", 5]]];
    }
    if (item == "1500") {
      return [...layerFilter, ...[["==", "own_group", 6]]];
    }
    if (item == "2000") {
      return [...layerFilter, ...[["==", "own_group", 7]]];
    }
    return null;
  });

  return ["none", ...fullFilter.flat(1)];
}
