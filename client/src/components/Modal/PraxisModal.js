import React, { Component } from "react";
import ReactDOM from "react-dom";
// import Modal from "react-modal";
import { connect } from "react-redux";
import {
  handleGetYearsAction,
  handleGetZipcodesAction,
  getYearAction,
  handleGetParcelsByQueryAction,
  dataIsLoadingAction,
} from "../../actions/mapData";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import { resetSearch, setSearchDisplayType } from "../../actions/search";
import {
  toggleFullResultsAction,
  togglePartialResultsAction,
  handleGetDownloadDataAction,
} from "../../actions/results";
import {
  toggleModalAction,
  toggleModalOptionsAction,
} from "../../actions/modal";
import "../../scss/Modal.scss";
import * as styleVars from "../../scss/colors.scss";
import * as urbanPraxisLogo from "../../assets/img/urban-praxis.jpg";
import * as macLogo from "../../assets/img/mac-logo-no-map.png";
// import Download from "react-csv/components/Download";
// import { searchPartialZipcode } from "../../actions/search";

const modalRoot = document.getElementById("modal-root");

class Modal extends Component {
  el = document.createElement("div");

  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

class PraxisModal extends React.Component {
  componentDidMount() {
    const yearsRoute = "/api/praxisyears";
    this.props.dispatch(handleGetYearsAction(yearsRoute));

    const zipcodesRoute = "/api/zipcode-search/praxiszipcodes";
    this.props.dispatch(handleGetZipcodesAction(zipcodesRoute));

    const { pathname } = window.location;

    if (pathname !== "/") {
      this.props.dispatch(toggleModalAction(false));
    }
  }

  render() {
    return (
      <div>
        <Modal>
          <Child {...this.props} />
        </Modal>
      </div>
    );
  }
}

class Child extends Component {
  handleClick = (selection) => {
    this.props.dispatch(toggleModalOptionsAction(selection));
  };

  _navOptions = ["Search", "Download Data", "About"];
  render() {
    // The click event on this button will bubble up to parent,
    // because there is no 'onClick' attribute defined
    const { selection } = this.props.modal;
    return (
      <header className="modal">
        <div className="modal-container">
          <div
            className="modal-close-button"
            onClick={() => {
              this.props.dispatch(toggleModalAction(false));
            }}
          >
            &#10006;
          </div>
          <h1>[LOGO]</h1>
          <div className="modal-nav">
            {this._navOptions.map((link) => {
              return (
                <div
                  key={link}
                  style={
                    selection === link ? { color: styleVars.ppRose } : null
                  }
                  onClick={() => {
                    this.handleClick(link);
                  }}
                >
                  {link.toUpperCase()}
                </div>
              );
            })}
          </div>
          {selection === "About" ? (
            <About {...this.props} />
          ) : selection === "Search" ? (
            <Search {...this.props} />
          ) : selection === "Download Data" ? (
            <DownloadData {...this.props} />
          ) : null}
          <div className="modal-footer">
            <a
              href="https://urbanpraxis.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={urbanPraxisLogo} alt="Urban Praxis"></img>
            </a>
            <a
              href="https://mappingaction.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={macLogo} alt="Mapping Action Collectivei"></img>
            </a>
          </div>
        </div>
      </header>
    );
  }
}

const About = (props) => {
  return (
    <div className="modal-content">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Etiam non quam lacus
        suspendisse faucibus interdum posuere lorem ipsum. In cursus turpis
        massa tincidunt. Neque vitae tempus quam pellentesque nec nam aliquam.
        Elit ut aliquam purus sit amet luctus. Tristique sollicitudin nibh sit
        amet commodo nulla facilisi nullam. In hac habitasse platea dictumst
        vestibulum rhoncus est. Quis eleifend quam adipiscing vitae proin
        sagittis nisl. Vivamus at augue eget arcu dictum. Et magnis dis
        parturient montes. Aliquam nulla facilisi cras fermentum odio eu feugiat
        pretium nibh. Ut etiam sit amet nisl purus. Sagittis id consectetur
        purus ut faucibus pulvinar elementum integer. Pretium quam vulputate
        dignissim suspendisse in est ante in. Risus viverra adipiscing at in
        tellus integer feugiat scelerisque. Enim neque volutpat ac tincidunt
        vitae semper quis lectus. Vel facilisis volutpat est velit egestas.
        Posuere lorem ipsum dolor sit. Vestibulum lorem sed risus ultricies
        tristique nulla. Sed nisi lacus sed viverra tellus in hac habitasse
        platea.
      </p>
    </div>
  );
};

class Search extends Component {
  render() {
    const { years, zipcodes } = this.props.mapData;
    if (years && zipcodes) {
      return <SearchForm {...this.props} />;
    }
    return null;
  }
}

class SearchForm extends Component {
  _zipcodeRef = React.createRef();

  _handleCheckboxChange = (event) => {
    //disable the zipcode box
    if (event.currentTarget.checked === true) {
      this._zipcodeRef.current.value = "";
      this._zipcodeRef.current.disabled = true;
    } else {
      this._zipcodeRef.current.disabled = false;
    }
  };

  _handleSubmit = (event) => {
    event.preventDefault();
    const yearValue = event.currentTarget[0].value;
    const zipcodeValue = event.currentTarget[1].value;
    const zipcodeCheckboxValue = event.currentTarget[2].checked;

    if (yearValue && zipcodeValue && !zipcodeCheckboxValue) {
      // close the modal
      this.props.dispatch(toggleModalAction(false));

      //trigger data loading
      this.props.dispatch(dataIsLoadingAction(true));

      // change the partial results
      // this.props.dispatch(handleSearchPartialZipcode(zipcodeValue, yearValue));

      // handle the query
      const geoJsonRoute = `/api/geojson/parcels/zipcode/${zipcodeValue}/${yearValue}`;
      this.props
        .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
        .then((geojson) => {
          //trigger new viewport pass down from PartialSearchResults
          this._createNewViewport(geojson);

          //trigger data loading off
          this.props.dispatch(dataIsLoadingAction(false));
        });
      //fill in the text input
      // this.props.dispatch(setSearchTerm(zipcodeValue));
      this.props.dispatch(
        resetSearch({
          searchTerm: zipcodeValue,
          searchType: "Zipcode",
        })
      );
      // set the display type to full
      this.props.dispatch(setSearchDisplayType("full-zipcode"));

      //close the partial results after
      this.props.dispatch(togglePartialResultsAction(false));

      // trigger the dowload data action
      const downloadDataRoute = `/api/zipcode-search/download/${zipcodeValue}/${yearValue}`;
      this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

      //toggle the results pane
      this.props.dispatch(toggleFullResultsAction(true));

      //change the url
      const state = null;
      const title = "";
      const newUrl = `/zipcode?search=${zipcodeValue}&year=${yearValue}`;

      //change the url
      window.history.pushState(state, title, newUrl);
    }

    if (yearValue && !zipcodeValue && zipcodeCheckboxValue) {
      // close the modal
      this.props.dispatch(toggleModalAction(false));
      this.props.dispatch(dataIsLoadingAction(true));
      this.props
        .dispatch(
          handleGetParcelsByQueryAction(`/api/geojson/parcels/${yearValue}`)
        )
        .then((geojson) => {
          this._createNewViewport(geojson);
          this.props.dispatch(dataIsLoadingAction(false));
        });
    }
  };

  _createNewViewport = (geojson) => {
    const { mapState } = this.props;
    //trigger new viewport
    const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
    this.props.dispatch(
      getMapStateAction({
        ...mapState,
        longitude,
        latitude,
        zoom,
        transitionDuration: 1000,
      })
    );
  };

  componentDidMount() {
    //this logic may be an anti-pattern

    const inputs = document.querySelectorAll("input[list]");
    for (let i = 0; i < inputs.length; i++) {
      // When the value of the input changes...
      inputs[i].addEventListener("change", function () {
        let optionFound = false,
          datalist = this.list;
        // Determine whether an option exists with the current value of the input.
        for (let j = 0; j < datalist.options.length; j++) {
          if (this.value == datalist.options[j].value) {
            optionFound = true;
            break;
          }
        }
        // use the setCustomValidity function of the Validation API
        // to provide an user feedback if the value does not exist in the datalist
        if (optionFound) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Please select a valid value.");
        }
      });
    }
  }

  render() {
    const { years, zipcodes } = this.props.mapData;

    return (
      <div className="modal-content">
        <div>Select a Detroit zipcode and year to start you search</div>
        <div>
          <form className="modal-form" onSubmit={this._handleSubmit}>
            <div>
              <label htmlFor="praxisYears">Select a year:</label>
              <input list="years" id="praxisYears" name="praxisYears" />
              <datalist id="years">
                {years.map((result) => (
                  <option key={result.praxisyear} value={result.praxisyear} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="praxisZipcodes">Select a zipcode:</label>
              <input
                list="zipcodes"
                id="praxisZipcodes"
                name="praxisZipcodes"
                ref={this._zipcodeRef}
              />
              <datalist id="zipcodes">
                {zipcodes.map((result) => (
                  <option key={result.zipcode} value={result.zipcode} />
                ))}
              </datalist>
            </div>

            <input
              type="checkbox"
              id="allPraxisZipcodes"
              name="allPraxisZipcodes"
              onChange={this._handleCheckboxChange}
            ></input>
            <label htmlFor="allPraxisZipcodes">
              Show me all zipcodes
              <span className="small-text">Loading time will be increased</span>
            </label>
            <label htmlFor="submitSearch"></label>
            <input
              type="submit"
              id="submitSearch"
              name="submitSearch"
              value="Search"
            ></input>
          </form>
        </div>
      </div>
    );
  }
}

const DownloadData = (props) => {
  return <div>Download Data (in development...)</div>;
};

function mapStateToProps({ modal, mapData, mapState }) {
  return { modal, mapData, mapState };
}
export default connect(mapStateToProps)(PraxisModal);
