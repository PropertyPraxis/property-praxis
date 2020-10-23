import React from "react";
import PropTypes from "prop-types";
import * as styleVars from "../../scss/colors.scss";

const launchStyles = {
  content: {
    zIndex: 1000,
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    texAlign: "center",
    fontSize: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: styleVars.uiTransparent,
    color: styleVars.uiWhite,
  },
};

class Loading extends React.Component {
  static defaultProps = {
    text: "Loading",
    speed: 300,
  };

  state = {
    text: this.props.text,
  };

  componentDidMount() {
    const { text, speed } = this.props;
    const stopper = text + "...";

    this.interval = window.setInterval(() => {
      this.state.text === stopper
        ? this.setState(() => ({ text: this.props.text }))
        : this.setState((prevState) => ({ text: prevState.text + "." }));
    }, speed);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  render() {
    const { loadingIsOpen } = this.props.mapState;

    if (loadingIsOpen) {
      return <div style={launchStyles.content}>{this.state.text}</div>;
    }
    return null;
  }
}

Loading.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number.isRequired,
};

export default Loading;
