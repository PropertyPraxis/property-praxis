import { getInitialMapData, getInitialZipcodeData } from "../utils/api";

export const GET_INITIAL_MAP_DATA = "GET_INITIAL_MAP_DATA";
export const GET_INITIAL_ZIPCODE_DATA = "GET_INITIAL_ZIPCODE_DATA";

function getInitialMapDataAction(data) {
  return {
    type: GET_INITIAL_MAP_DATA,
    payload: { ppraxis: data }
  };
}

function getInitialZipcodeDataAction(data) {
  return {
    type: GET_INITIAL_ZIPCODE_DATA,
    payload: { zips: data }
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

export function handleGetInitialZipcodeDataAction(route) {
  return dispatch => {
    return getInitialZipcodeData(route)
      .then(json => {
        dispatch(getInitialZipcodeDataAction({}));
        dispatch(getInitialZipcodeDataAction(json));
      })
      .catch(err => {
        alert(err);
      });
  };
}
