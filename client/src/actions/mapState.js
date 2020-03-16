export const GET_MAP_STATE = "GET_MAP_STATE";
// export const NEW_MAP_STATE = "NEW_MAP_STATE";

export function getMapStateAction(viewport) {
  return {
    type: GET_MAP_STATE,
    payload: viewport
  };
}

// export function newMapStateAction(viewport) {
//   return {
//     type: NEW_MAP_STATE,
//     payload: viewport
//   };
// }
