import React from "react";
import PropTypes from "prop-types";

const launchStyles = {
  content: {
    texAlign: "center",
    fontSize: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#343332",
    color: "#ffffff",
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
    return <div style={launchStyles.content}>{this.state.text}</div>;
  }
}

Loading.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number.isRequired,
};

export default Loading;
