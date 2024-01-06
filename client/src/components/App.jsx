import React, { Component } from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { connect } from "react-redux"
import { setDocHeightOnWindow } from "../utils/helper"
import Home from "./pages/Home"
import DownloadData from "./pages/DownloadData"
import About from "./pages/About"
import Methodology from "./pages/Methodology"
import MapContainer from "./Map/MapContainer"
import SearchContainer from "./Search/SearchContainer"
import DetailedResultsContainer from "./Search/DetailedResultsContainer"
import LoadingIndicator from "./LoadingIndicator/LoadingIndicator"
import Error from "./Redirect/Error"
import PPLogo from "./Logo/Logo"

class App extends Component {
  componentDidMount() {
    //set window height for mobile
    setDocHeightOnWindow()
  }

  render() {
    return (
      <div className="app-container">
        <Router>
          <Switch>
            <Route exact path={"/"} component={Home}></Route>
            <Route path={"/map"} component={MapContainer}></Route>
            <Route path={"/data"} component={DownloadData}></Route>
            <Route path={"/methodology"} component={Methodology}></Route>
            <Route path={"/about"} component={About}></Route>
          </Switch>
          {/* The following components are inside Router to have access to Link */}
          <SearchContainer />
          <DetailedResultsContainer />
          <PPLogo />
          <LoadingIndicator {...this.props} />
          <Error />
        </Router>
      </div>
    )
  }
}

function mapStateToProps({ mapData, mapState, redirect }) {
  return { mapData, mapState, redirect }
}
export default connect(mapStateToProps)(App)
