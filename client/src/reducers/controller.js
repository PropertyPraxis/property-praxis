import {
  SET_SLIDER_VALUE,
  SET_PARCEL_FILTER,
  TOGGLE_BASEMAP
} from "../actions/controller";

const initialControllerState = {
  sliderValue: 100,
  filter: [],
  basemapLayer: "mapbox://styles/mappingaction/ck8agoqtt043l1ik9bvf3v0cv"
};

export default function controller(state = initialControllerState, action) {
  switch (action.type) {
    case SET_SLIDER_VALUE:
      return { ...state, ...action.payload };
    case SET_PARCEL_FILTER:
      const newFilter = action.payload.filter;
      const oldFilter = state.filter;
      let filter;
      oldFilter.indexOf(newFilter[0]) > -1
        ? (filter = oldFilter.filter(item => item !== newFilter[0]))
        : (filter = [...oldFilter, ...newFilter]);
      return { ...state, ...{ filter } };
    case TOGGLE_BASEMAP:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
