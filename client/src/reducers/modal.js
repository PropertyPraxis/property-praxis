import { TOGGLE_MODAL } from "../actions/modal";

export default function toggleModal(state = true, action) {
  switch (action.type) {
    case TOGGLE_MODAL:
      return action.payload;
    default:
      return state;
  }
}
