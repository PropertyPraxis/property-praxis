import React, { Component } from "react";
import Modal from "react-modal";
import { connect } from "react-redux";
import { toggleModalAction } from "../../actions/modal";
import "../../scss/Modal.scss";

// set Modal
Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "black"
  }
};

class PraxisModal extends Component {
  render() {
    console.log("Modal props", this.props);
    return (
      <div>
        <Modal
          isOpen={true}
          contentLabel="Property Praxis Modal"
          className="modal"
          overlayClassName="overlay"
          // style={customStyles}
        >
          <div>
            <h1>Welcome to Property Praxis</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Etiam
              non quam lacus suspendisse faucibus interdum posuere lorem ipsum.
              In cursus turpis massa tincidunt. Neque vitae tempus quam
              pellentesque nec nam aliquam. Elit ut aliquam purus sit amet
              luctus. Tristique sollicitudin nibh sit amet commodo nulla
              facilisi nullam. In hac habitasse platea dictumst vestibulum
              rhoncus est. Quis eleifend quam adipiscing vitae proin sagittis
              nisl. Vivamus at augue eget arcu dictum. Et magnis dis parturient
              montes. Aliquam nulla facilisi cras fermentum odio eu feugiat
              pretium nibh. Ut etiam sit amet nisl purus. Sagittis id
              consectetur purus ut faucibus pulvinar elementum integer. Pretium
              quam vulputate dignissim suspendisse in est ante in. Risus viverra
              adipiscing at in tellus integer feugiat scelerisque. Enim neque
              volutpat ac tincidunt vitae semper quis lectus. Vel facilisis
              volutpat est velit egestas. Posuere lorem ipsum dolor sit.
              Vestibulum lorem sed risus ultricies tristique nulla. Sed nisi
              lacus sed viverra tellus in hac habitasse platea.
            </p>
            <button
              onClick={() => {
                this.props.dispatch(toggleModalAction(false));
              }}
            >
              Get Started
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps({ isModalOpen }) {
  return { isModalOpen };
}
export default connect(mapStateToProps)(PraxisModal);
