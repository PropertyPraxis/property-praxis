export const TOGGLE_MODAL = "TOGGLE_MODAL";

export function toggleModalAction(isOpen) {
  return {
    type: TOGGLE_MODAL,
    payload: isOpen
  };
}
