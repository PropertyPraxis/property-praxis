import React, { Component } from "react";
import { CSVLink, CSVDownload } from "react-csv";
import { AsyncParser } from "json2csv";

class DownloadData extends Component {
  render() {
    return (
      <div
        onClick={() => {
          console.log("hello");
          const fields = ["field1", "field2", "field3"];
          const opts = { fields };
          const transformOpts = { highWaterMark: 8192 };

          const asyncParser = new AsyncParser(opts, transformOpts);

          let csv = "";
          asyncParser.processor
            .on("data", chunk => {
              return (csv += chunk.toString());
            })
            .on("end", () => console.log(csv))
            .on("error", err => console.error(err));
        }}
      >
        Download Data
      </div>
    );
  }
}

export default DownloadData;
