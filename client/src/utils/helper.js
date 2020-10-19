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
export function parseSearchResults({
  results,
  index,
  searchType: type,
  searchYear: year,
}) {
  let result;

  if (type === "all") {
    /* This loop selects the first list in the all 
    arrary with elements. Then uses the index to 
    select a result from that list.
    The order of all results will 
    always be address, speculator, zip */
    for (let i = 0; i < results.length; i++) {
      if (results[i].length === 0) {
        continue;
      } else {
        result = results[i][index.inner];
        break;
      }
    }
  } else if (
    type === "address" ||
    type === "speculator" ||
    type === "zipcode"
  ) {
    result = results[index.inner];
  }

  return sanitizeSearchResult(result, year);
}

export function sanitizeSearchResult(result, year) {
  // result return sanitized result object
  const keys = Object.keys(result);
  if (keys.includes("propzip")) {
    const zipcodeQuery = {
      type: "zipcode",
      search: result.propzip,
      coordinates: null,
      year,
    };
    return zipcodeQuery;
  } else if (keys.includes("own_id")) {
    const speculatorQuery = {
      type: "speculator",
      search: result.own_id,
      coordinates: null,
      year,
    };
    return speculatorQuery;
  } else if (keys.includes("place_name")) {
    const [longitude, latitude] = result.geometry.coordinates;
    const encodedCoords = encodeURI(JSON.stringify({ longitude, latitude }));
    const addressQuery = {
      type: "address",
      search: result.place_name,
      coordinates: encodedCoords,
      year,
    };
    return addressQuery;
  } else {
    throw new Error(
      `Known key does not exist in object: ${JSON.stringify(result)}`
    );
  }
}

export function createQueryStringFromSearch({
  type,
  search,
  coordinates,
  year,
}) {
  const query = `/map?${queryString.stringify(
    { type, search, coordinates, year },
    { sort: false }
  )}`;

  return query;
}
