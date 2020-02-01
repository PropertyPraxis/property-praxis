const { Pool } = require("pg");

//DB Connection
const CONNECTION_STRING = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: CONNECTION_STRING,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  templateQuery: text => pool.query(text)
};
