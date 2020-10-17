import queryString from "query-string";

//logic to render mobile properly

export function setDocHeightOnWindow() {
  function setDocHeight() {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight / 100}px`
    );
  }
  window.addEventListener("resize", function () {
    setDocHeight();
  });
  window.addEventListener("orientationchange", function () {
    setDocHeight();
  });

  setDocHeight();
}

export function capitalizeFirstLetter(string) {
  if (string === null) return null;
  const lowerString = string.toLowerCase();
  const strArray = lowerString.split(" ");
  const capitalizedStrArray = strArray.map((val) => {
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
    .map((feature) => {
      if (feature.properties.distance === 0) {
        return feature;
      }
      return null;
    })
    .filter((result) => result !== null);

  const nearbyAddresses = features
    .map((feature) => {
      if (feature.properties.distance !== 0) {
        return feature;
      }
      return null;
    })
    .filter((result) => result !== null);

  return { targetAddress, nearbyAddresses };
}

export function createAddressString({ propno, propdir, propstr, propzip }) {
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

  const fullFilter = arr.map((item) => {
    if (item === "10-20") {
      return [...layerFilter, ...[["==", "own_group", 1]]];
    }
    if (item === "100") {
      return [...layerFilter, ...[["==", "own_group", 2]]];
    }
    if (item === "200") {
      return [...layerFilter, ...[["==", "own_group", 3]]];
    }
    if (item === "500") {
      return [...layerFilter, ...[["==", "own_group", 4]]];
    }
    if (item === "1000") {
      return [...layerFilter, ...[["==", "own_group", 5]]];
    }
    if (item === "1500") {
      return [...layerFilter, ...[["==", "own_group", 6]]];
    }
    if (item === "2000") {
      return [...layerFilter, ...[["==", "own_group", 7]]];
    }
    return null;
  });

  return ["none", ...fullFilter.flat(1)];
}

export function createDateString() {
  return new Date().toDateString().replace(/ /g, "_");
}

export function addUnderscoreToString(val) {
  return val.replace(/ /g, "_");
}

export function getYearString() {
  return new Date().getFullYear();
}

/* function to parse search 
result and return query string */
export function parseSearchResults({ results, type, year }) {
  let result;

  if (type === "all") {
    /* the order of all results will 
    always be address, speculator, zip */
    for (let i = 0; i < results.length; i++) {
      if (results[i].length === 0) {
        continue;
      } else {
        result = results[i][0];
        break;
      }
    }
  } else if (
    type === "address" ||
    type === "speculator" ||
    type === "zipcode"
  ) {
    result = results[0];
  }

  //depending on result return proper query string
  const keys = Object.keys(result);
  if (keys.includes("propzip")) {
    const zipcodeQuery = {
      type: "zipcode",
      search: result.propzip,
      year,
    };
    return queryString.stringify(zipcodeQuery, { sort: false });
  } else if (keys.includes("own_id")) {
    const speculatorQuery = {
      type: "speculator",
      search: result.own_id,
      year,
    };
    return queryString.stringify(speculatorQuery, { sort: false });
  } else if (keys.includes("place_name")) {
    const [longitude, latitude] = result.geometry.coordinates;
    const encodedCoords = encodeURI(JSON.stringify({ longitude, latitude }));
    const addressQuery = {
      type: "address",
      search: result.place_name,
      coordinates: encodedCoords,
      year,
    };
    return queryString.stringify(addressQuery, { sort: false });
  } else {
    throw new Error(
      `Known key does not exist in object: ${JSON.stringify(result)}`
    );
  }
}
