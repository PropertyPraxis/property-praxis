const express = require("express");
const { Client } = require("pg");
const { Pool } = require("pg");
const app = express();
const cors = require("cors");

app.use(cors());
console.log(process.env)
// const client = new Client({
//   user: "user",
//   host: "postgres",
//   database: "db",
//   password: "pass"
// });
// client.connect();
// client.query("SELECT NOW()", (err, res) => {
//   console.log(err, res);
//   client.end();
// });

// const pool = new Pool({
//   host: "postgres",
//   user: "user",
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000
// });

app.get("/", (req, res) => {
  res.json({ message: "Hello World!!!!!" });
});

// app.get("/test", (req, res) => {
//   client.connect();
//   client
//   .query('SELECT * FROM property LIMIT 10')
//   .then(res => console.log(res.rows[0]))
//   .catch(e => console.error(e.stack))

// });
// client
//   .query('SELECT * FROM property LIMIT 10')
//   .then(res => console.log(res.rows[0]))
//   .catch(e => console.error(e.stack))
// // client.end();

app.listen(5000, () => {
  console.log("listening on port 5000");
});
