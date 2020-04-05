import React, { Component } from "react";
import ReactDOM from "react-dom";
// import Modal from "react-modal";
import { connect } from "react-redux";
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
  // state = {
  //   selection: "Search",
  // };

  // handleClick = this.handleClick;

  // handleClick(selection) {
  //   // This will fire when the button in Child is clicked,
  //   // updating Parent's state, even though button
  //   // is not direct descendant in the DOM.'
  //   this.setState({ selection });
  // }

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
            <About />
          ) : selection === "Search" ? (
            <Search />
          ) : selection === "Download Data" ? (
            <DownloadData />
          ) : null}
          <div className="modal-footer">
            <a href="https://urbanpraxis.org/" target="_blank">
              <img src={urbanPraxisLogo} alt="Urban Praxis"></img>
            </a>
            <a href="https://mappingaction.org/" target="_blank">
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

const Search = (props) => {
  return (
    <div className="modal-content">
      <div>Select a Detroit zipcode to start you search</div>
      <div>
        <form action="">
          <label htmlFor="zips"></label>
          <select id="zips" name="zips">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="fiat">Fiat</option>
            <option value="audi">Audi</option>
          </select>
          {/* <input type="submit" /> */}
        </form>
        <div>Show me the whole dataset (This will take a moment)</div>
      </div>
    </div>
  );
};

const DownloadData = (props) => {
  return <div>Download Data</div>;
};

function mapStateToProps({ modal }) {
  return { modal };
}
export default connect(mapStateToProps)(PraxisModal);

// class PraxisModal extends Component {
//   // componentDidMount() {
//   //   debugger;
//   //   if (
//   //     window.location.pathname.length > 1 &&
//   //     searchPartialZipcode.length > 1
//   //   ) {
//   //     this.props.dispatch(toggleModalAction(false));
//   //   }
//   // }

//   render() {
//     return ReactDOM.createPortal(
//       <div>
//         <div className="modal">
//           <h1>Welcome to Property Praxis</h1>
//           <p>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//             eiusmod tempor incididunt ut labore et dolore magna aliqua. Etiam
//             non quam lacus suspendisse faucibus interdum posuere lorem ipsum. In
//             cursus turpis massa tincidunt. Neque vitae tempus quam pellentesque
//             nec nam aliquam. Elit ut aliquam purus sit amet luctus. Tristique
//             sollicitudin nibh sit amet commodo nulla facilisi nullam. In hac
//             habitasse platea dictumst vestibulum rhoncus est. Quis eleifend quam
//             adipiscing vitae proin sagittis nisl. Vivamus at augue eget arcu
//             dictum. Et magnis dis parturient montes. Aliquam nulla facilisi cras
//             fermentum odio eu feugiat pretium nibh. Ut etiam sit amet nisl
//             purus. Sagittis id consectetur purus ut faucibus pulvinar elementum
//             integer. Pretium quam vulputate dignissim suspendisse in est ante
//             in. Risus viverra adipiscing at in tellus integer feugiat
//             scelerisque. Enim neque volutpat ac tincidunt vitae semper quis
//             lectus. Vel facilisis volutpat est velit egestas. Posuere lorem
//             ipsum dolor sit. Vestibulum lorem sed risus ultricies tristique
//             nulla. Sed nisi lacus sed viverra tellus in hac habitasse platea.
//           </p>
//           <button
//             onClick={() => {
//               this.props.dispatch(toggleModalAction(false));
//             }}
//           >
//             Get Started
//           </button>
//         </div>
//       </div>
//     );
//   }
// }
