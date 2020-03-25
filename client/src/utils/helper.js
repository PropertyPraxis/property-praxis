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
