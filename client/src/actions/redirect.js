export const FETCH_ERROR = "FETCH_ERROR";

export function triggerFetchError(isFetchError) {
  return {
    type: FETCH_ERROR,
    payload: { isFetchError },
  };
}
