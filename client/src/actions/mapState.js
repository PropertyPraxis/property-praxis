export const GET_MAP_STATE = "GET_MAP_STATE";


export function getMapStateAction(viewport) {
  return {
    type: GET_MAP_STATE,
    payload: viewport
  };
}

