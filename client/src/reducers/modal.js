import { TOGGLE_MODAL, TOGGLE_MODAL_OPTIONS } from "../actions/modal";

const initialModalState = {
  selection: "Search",
  isOpen: false,
};

export default function modal(state = initialModalState, action) {
  switch (action.type) {
    case TOGGLE_MODAL:
      return { ...state, ...action.payload };
    case TOGGLE_MODAL_OPTIONS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
