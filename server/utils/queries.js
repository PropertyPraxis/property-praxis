const queries = {
  zipcodes: {
    route: "/api/geojson/zipcodes",
    query: `SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(geometry, 6)::json,
      'properties', to_jsonb(inputs) - 'geometry'
    ) AS feature
    FROM (
      SELECT * FROM zips_geom
    ) inputs
  ) features;`,
  },
  ppraxis: {
    route: "/api/geojson/parcels/:year",
    query: `SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(feature)
      )
      FROM (
        SELECT jsonb_build_object(
          'type',       'Feature',
          'id',          feature_id,
          'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
          'centroid',   ST_AsText(centroid),
          'properties', to_jsonb(inputs) - 
            'geom_${year}' - 'parcelno' - 'cityrbuilt' - 'praxisyear' - 
            'propaddr' - 'resyrbuilt' -
            'row.names' - 'saledate' - 'saleprice' - 'taxparprop_id' - 
            'taxpayer1' - 'totacres' - 'totsqft' - 'centroid'
        ) AS feature
        FROM (
          SELECT * FROM parcels_${year} LIMIT 1000
        ) inputs
      ) features;`,
  },
  addressSearch: {
    route: "/api/address-search/full/:coords/:year",
    query: `SELECT DISTINCT p.*, otp.own_id 
      FROM parcel_property_geom AS ppg
      INNER JOIN property as p ON ppg.parprop_id = p.parprop_id
      INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
      INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
      INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
      INNER JOIN owner_taxpayer as otp ON tp.owntax_id = otp.owntax_id
      WHERE y.praxisyear = $1 AND
      ST_Intersects(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ppg.geom_${year})`,
  },
  addressSearchDownload: {
    //NOTE THERE IS ANOTHER QUERY IN searchAdress.js
    route: "/api/address-search//download/:coords/:year",
    query: `SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) as id, 
      own_id, count as property_count, 
      parcelno, propaddr, propno, propdir, propstr, propzip,
      resyrbuilt, saledate, saleprice, taxpayer1, totacres, totsqft, 
      ST_Y(centroid) as latitude, ST_X(centroid) as longitude,
      FROM parcels_${year} 
      WHERE ST_Intersects(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), geom_${year})`,
  },
};
