export const TOGGLE_RESULTS = "TOGGLE_RESULTS";

export function toggleResultsAction(isOpen) {
  return {
    type: TOGGLE_RESULTS,
    payload: isOpen
  };
}
