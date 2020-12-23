import { FETCH_ERROR } from "../actions/redirect";

const initialRedirectState = {
  isFetchError: false,
};

export default function redirect(state = initialRedirectState, action) {
  switch (action.type) {
    case FETCH_ERROR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
