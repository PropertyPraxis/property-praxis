import React, { useState, useEffect } from "react";
import { APISearchQueryFromRoute } from "../../utils/api";
import { VictoryChart, VictoryLine, VictoryTheme } from "victory";
import * as styleVars from "../../scss/colors.scss";

function TimeGraph({ ownid }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      if (ownid) {
        const route = `/api/detailed-search?type=speculator-by-year&ownid=${ownid.toUpperCase()}`;
        const data = await APISearchQueryFromRoute(route);
        const graph_data = data
          .map((record) => {
            // cast data
            const { praxisyear, count } = record;
            return {
              year: new Date(praxisyear, 1, 1),
              count: Number(count),
            };
          })
          .sort((a, b) => {
            return a.year - b.year;
          });
        console.log("GRAPH DATA xxxxxxxxx", graph_data);
        setData(graph_data);
      }
    })();
    return () => null;
  }, [ownid]);

  return (
    <VictoryChart
      theme={VictoryTheme.material}
      scale={{ x: "time" }}
      // animate={{ duration: 500 }}
    >
      <VictoryLine
        style={{
          data: { stroke: styleVars.ppRose },
          parent: { border: "1px solid #ccc" },
        }}
        data={data}
        x="year"
        y="count"
      />
    </VictoryChart>
  );
}

export default TimeGraph;
