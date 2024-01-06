import React from "react";
import { useSelector } from "react-redux";
import Footer from "../pages/Footer";
import TopContainer from "../pages/TopContainer";
import errorIcon from "../../assets/img/error_icon.svg";

function Error() {
  const { isFetchError, message } = useSelector((state) => state.redirect);

  if (isFetchError) {
    return (
      <main className="main-container">
        <div className="page-container">
          <TopContainer title="Something Went Wrong!" />
          <div className="middle-container">
            <div>
              <img src={errorIcon} alt="An illustration of an error"></img>
            </div>
            <div>{message}</div>
          </div>
          <Footer />
        </div>
      </main>
    );
  }
  return null;
}

export default Error;
