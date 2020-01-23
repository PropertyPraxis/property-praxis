import { getInitialMapData } from "../utils/api";

export const GET_INITIAL_MAP_DATA = "GET_INITIAL_MAP_DATA";

function getInitialMapDataAction(data) {
  return {
    type: GET_INITIAL_MAP_DATA,
    payload: data
  };
}

export function handleGetInitialMapDataAction(route) {
  return dispatch => {
    return getInitialMapData(route)
      .then(json => {
        dispatch(getInitialMapDataAction({}));
        dispatch(getInitialMapDataAction(json));
      })
      .catch(err => {
        alert(err);
      });
  };
}
