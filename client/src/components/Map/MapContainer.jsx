import React, { Component } from "react"
import { withRouter } from "../../utils/router"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { URLParamsToSearchParams } from "../../utils/parseURL"
import PraxisMap from "./Map"

/*The MapContainer is responsible for passing 
the search params to the map*/
class MapContainer extends Component {
  render() {
    const searchParams = URLParamsToSearchParams(
      this.props.router?.location?.search
    )

    return <PraxisMap {...this.props} searchParams={searchParams} />
  }
}

MapContainer.propTypes = {
  mapState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  searchState: PropTypes.object.isRequired,
  currentFeature: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  controller: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  mapParams: PropTypes.object.isRequired,
}

function mapStateToProps({
  mapState,
  mapData,
  searchState,
  currentFeature,
  results,
  controller,
}) {
  return {
    mapState,
    mapData,
    searchState,
    currentFeature,
    results,
    controller,
  }
}

export default withRouter(connect(mapStateToProps)(MapContainer))

// _setSearchParams = ({
//   searchType,
//   searchTerm,
//   searchYear,
//   searchCoordinates,
// }) => {
//   this.props.dispatch(
//     resetSearch({
//       searchType,
//       searchTerm,
//       searchCoordinates,
//       searchYear,
//     })
//   );
// };

// componentDidMount() {
//   const { search: searchQuery } = this.props.location;
//   const {
//     searchType,
//     searchTerm,
//     searchCoordinates,
//     searchYear,
//   } = parseURLParams(searchQuery);

//   this._setSearchParams({
//     searchType,
//     searchTerm,
//     searchCoordinates,
//     searchYear,
//   });
// }

// componentDidUpdate(prevProps) {
//   // if the location changes, set the params
//   if (this.props.location.search !== prevProps.location.search) {
//     const { search: searchQuery } = this.props.location;
//     const {
//       searchType,
//       searchTerm,
//       searchCoordinates,
//       searchYear,
//     } = parseURLParams(searchQuery);

//     this._setSearchParams({
//       searchType,
//       searchTerm,
//       searchCoordinates,
//       searchYear,
//     });
//   }
// }
