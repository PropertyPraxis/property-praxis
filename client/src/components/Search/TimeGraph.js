import React, { useState, useEffect } from "react";
import { APISearchQueryFromRoute } from "../../utils/api";

function TimeGraph({ ownid }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      if (ownid) {
        const route = `/api/detailed-search?type=speculator-by-year&ownid=${ownid}`;
        const data = await APISearchQueryFromRoute(route);
        console.log(data);
        setData(data);
      }
    })();
    return () => null;
  }, [ownid]);

  return <div>{JSON.stringify(data)}</div>;
}

export default TimeGraph;
