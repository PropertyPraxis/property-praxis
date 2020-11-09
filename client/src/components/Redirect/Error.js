import React from "react";
import { useSelector } from "react-redux";

function Error() {
  const { searchState } = useSelector((state) => state);
  debugger;
  return (
    <main>
      <h1>Whoops and error occurred.</h1>
    </main>
  );
}

export default Error;
