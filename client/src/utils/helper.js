import { feature } from "@turf/turf";
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

/* result return sanitized result object with keys that 
can be used to map through primary results*/
export function sanitizeSearchResult({ result, year }) {
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
    { sort: false, skipNull: true }
  )}`;

  return query;
}

export function flattenPrimaryResults(primaryResults) {
  return primaryResults.reduce((acc, val) => acc.concat(val), []);
}

export function getPropertiesFromMapData(geojson) {
  if (geojson) {
    const details = geojson.features.map((feature) => {
      const { id, properties } = feature;
      return { id, properties };
    });
    return details;
  } else {
    return null;
  }
}

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function availablePraxisYears(praxisYears, currentYear) {
  if (praxisYears && currentYear) {
    const availableYears = praxisYears
      .map(({ praxisyear }) => praxisyear)
      .filter((year) => year !== Number(currentYear));
    return availableYears;
  } else {
    return null;
  }
}
