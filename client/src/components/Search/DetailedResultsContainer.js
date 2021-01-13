import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import queryString from "query-string";
import { updateDetailedSearch } from "../../actions/search";
import { getDetailsFromGeoJSON } from "../../utils/helper";
import DetailedSearchResults from "./DetailedSearchResults";

function useQueryParams(props) {
  const { searchQuery } = props;

  const [queryParams, setQueryParams] = useState(null);
  useEffect(() => {
    const params = queryString.parse(searchQuery);
    setQueryParams(params);
    return () => null;
  }, [searchQuery]);

  return queryParams;
}

function DetailedResultsContainer() {
  const { ppraxis } = useSelector((state) => state.mapData);
  const { drawerIsOpen, results, resultsType } = useSelector(
    (state) => state.searchState.detailedSearch
  );
  const { details, detailsType } = getDetailsFromGeoJSON(ppraxis);
  const dispatch = useDispatch();

  const queryParams = useQueryParams({ searchQuery: window.location.search });
  useEffect(() => {
    dispatch(
      updateDetailedSearch({
        results: details,
        resultsType: detailsType,
      })
    );
  }, [JSON.stringify(details), detailsType]);

  if (results && resultsType && queryParams) {
    return (
      <CSSTransition
        in={drawerIsOpen} //set false on load
        appear={true}
        timeout={400}
        classNames="results-drawer"
        onEntered={() =>
          dispatch(
            updateDetailedSearch({
              contentIsVisible: true,
            })
          )
        }
        onExit={() =>
          dispatch(
            updateDetailedSearch({
              contentIsVisible: false,
            })
          )
        }
      >
        <DetailedSearchResults
          detailsType={detailsType}
          queryParams={queryParams}
        />
      </CSSTransition>
    );
  }
  return null;
}

export default withRouter(DetailedResultsContainer);
