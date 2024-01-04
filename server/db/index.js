const { Pool } = require("pg");

//DB Connection
const dbCredentials = JSON.parse(process.env.DATABASE_CREDENTIALS || "{}");
const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  `postgresql://${dbCredentials.username}:${dbCredentials.password}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  templateQuery: (text) => pool.query(text),
};
