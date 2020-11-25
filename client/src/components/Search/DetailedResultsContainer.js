import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { updateDetailedSearch } from "../../actions/search";
import { getDetailsFromGeoJSON } from "../../utils/helper";
import DetailedSearchResults from "./DetailedSearchResults";

function DetailedResultsContainer() {
  const { ppraxis } = useSelector((state) => state.mapData);
  const { drawerIsOpen, results, resultsType } = useSelector(
    (state) => state.searchState.detailedSearch
  );

  const { details, detailsType } = getDetailsFromGeoJSON(ppraxis);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      updateDetailedSearch({
        results: details,
        resultsType: detailsType,
      })
    );
  }, [JSON.stringify(details), detailsType]);

  if (results && resultsType) {
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
        <DetailedSearchResults details={details} detailsType={detailsType} />
      </CSSTransition>
    );
  }
  return null;
}

export default withRouter(DetailedResultsContainer);
