import React from "react";
import Footer from "./Footer";
import { Link } from "react-router-dom";

const DownloadData = (props) => {
  return (
    <main className="main-container">
      <div className="page-container">
        <div className="top-container">
          <Link to={{ pathname: "/" }}>
            <div className="top-logo">
              <img
                src="https://property-praxis-web.s3-us-west-2.amazonaws.com/pp_logo_transparent.png"
                alt="Property Praxis logo"
              ></img>
            </div>
          </Link>
        </div>
        <div className="middle-container">
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default DownloadData;
// import React from "react";
// import { AsyncParser } from "json2csv";

// const DownloadData = () => {
//   return (
//     <div
//       onClick={() => {
//         const fields = ["field1", "field2", "field3"];
//         const opts = { fields };
//         const transformOpts = { highWaterMark: 8192 };

//         const asyncParser = new AsyncParser(opts, transformOpts);

//         let csv = "";
//         asyncParser.processor
//           .on("data", (chunk) => {
//             return (csv += chunk.toString());
//           })
//           .on("end", () => console.log(csv))
//           .on("error", (err) => console.error(err));
//       }}
//     >
//       Download Data
//     </div>
//   );
// };

// export default DownloadData;

////////////////////////////////////////////////////////////////
