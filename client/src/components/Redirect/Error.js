import React from "react";
import { useSelector } from "react-redux";
import Footer from "../pages/Footer";
import TopContainer from "../pages/TopContainer";

function Error() {
  const { isFetchError } = useSelector((state) => state.redirect);

  if (isFetchError) {
    return (
      <main className="main-container">
        <div className="page-container">
          <TopContainer title="Something Went Wrong!" />
          <div className="middle-container"></div>
          <Footer />
        </div>
      </main>
    );
  }
  return null;
}

export default Error;
