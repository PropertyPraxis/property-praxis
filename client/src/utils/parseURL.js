import queryString from "query-string";

/*Default search params */
const defaultParams = {
  type: "zipcode",
  search: "48209",
  coordinates: null,
  year: "2020",
};

export function parseURLParams(searchQuery) {
  let {
    type: searchType,
    search: searchTerm,
    coordinates: searchCoordinates,
    year: searchYear,
  } = queryString.parse(searchQuery);

  if (searchType === undefined) {
    searchType = defaultParams.type;
  }
  if (searchTerm === undefined) {
    searchTerm = defaultParams.search;
  }
  if (searchCoordinates === undefined) {
    searchCoordinates = defaultParams.searchCoordinates;
  }
  if (searchYear === undefined) {
    searchYear = defaultParams.searchYear;
  }

  return {
    searchType,
    searchTerm,
    searchCoordinates,
    searchYear,
  };
}

// const defaultParamsPROTO = {
//   type: null,
//   code: null,
//   ownid: null,
//   coordinates: null,
//   year: "2020",
// };

// export function parseURLParamsPROTO(searchQuery) {
//   let { type, code, ownid, coordinates, year } = queryString.parse(searchQuery);
//   debugger;
//   switch (type) {
//     case "zipcode":
//       break;
//     case "speculator":
//       break;
//     case "address":
//       break;
//     default:
//       break;
//   }

//   return {
//     searchType: type,
//     searchYear: year,
//   };
// }
