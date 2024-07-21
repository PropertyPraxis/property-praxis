import React, { useState, useEffect } from "react"
import { APISearchQueryFromRoute } from "../../utils/api"
import { VictoryChart, VictoryLine, VictoryTheme } from "victory"

function TimeGraph({ ownid }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    ;(async () => {
      if (ownid) {
        const route = `/api/detailed-search?type=speculator-by-year&ownid=${ownid.toUpperCase()}`
        const data = await APISearchQueryFromRoute(route)
        const graph_data = data
          .map(({ year, count }) => ({
            x: new Date(year, 1, 1),
            y: Number(count),
          }))
          .sort((a, b) => a.year - b.year)
        setData(graph_data)
      }
    })()
    return () => null
  }, [ownid])

  return (
    <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
      <VictoryLine
        style={{
          data: { stroke: "#e4002c" },
          parent: { border: "1px solid #ccc" },
        }}
        data={data}
      />
    </VictoryChart>
  )
}

export default TimeGraph
