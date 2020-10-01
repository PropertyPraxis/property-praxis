import React from "react";
import Footer from "./Footer";
import TopContainer from "./TopContainer";

const DownloadData = (props) => {
  return (
    <main className="main-container">
      <div className="page-container">
        <TopContainer />
        <div className="middle-container"></div>
        <Footer />
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
