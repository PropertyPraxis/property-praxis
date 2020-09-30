import React from "react";
import PropTypes from "prop-types";

const DownloadData = (props) =>{

  return(
    <main>
      <div className="home-container">
        
      </div>
    </main>
  )
}

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
