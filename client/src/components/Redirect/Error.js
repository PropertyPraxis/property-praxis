import React from "react";
import { useSelector } from "react-redux";
import Footer from "../pages/Footer";
import TopContainer from "../pages/TopContainer";

function Error() {
  const { isFetchError, message } = useSelector((state) => state.redirect);

  if (isFetchError) {
    return (
      <main className="main-container">
        <div className="page-container">
          <TopContainer title="Something Went Wrong!" />
          <div className="middle-container">
            <div>
              <img
                src="https://property-praxis-web.s3-us-west-2.amazonaws.com/error_icon.svg"
                alt="An illustration of an error"
              ></img>
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
