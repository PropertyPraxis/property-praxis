export const FETCH_ERROR = "FETCH_ERROR";

export function triggerFetchError(
  isFetchError,
  message = "Whoops! Something went wrong. Please try another search."
) {
  return {
    type: FETCH_ERROR,
    payload: { isFetchError, message },
  };
}
