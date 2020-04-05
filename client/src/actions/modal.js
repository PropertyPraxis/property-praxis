export const TOGGLE_MODAL = "TOGGLE_MODAL";
export const TOGGLE_MODAL_OPTIONS = "TOGGLE_MODAL_ACTION";


export function toggleModalAction(isOpen) {
  return {
    type: TOGGLE_MODAL,
    payload: { isOpen },
  };
}

export function toggleModalOptionsAction(selection) {
  return {
    type: TOGGLE_MODAL_OPTIONS,
    payload: { selection },
  };
}
