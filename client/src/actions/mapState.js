export const GET_MAP_STATE = "GET_MAP_STATE";
export const GET_MAP_PARAMS = "GET_MAP_PARAMS";

export function getMapStateAction(viewport) {
  return {
    type: GET_MAP_STATE,
    payload: { viewport },
  };
}

export function getMapParamsAction(params) {
  return {
    type: GET_MAP_PARAMS,
    payload: { params },
  };
}
