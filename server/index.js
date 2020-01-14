const express = require("express");
const { Client } = require("pg");
const app = express();
const cors = require("cors");

app.use(cors());

const client = new Client({
  user: "user",
  host: "postgres",
  database: "db",
  password: "pass"
});
client.connect();
client.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  client.end();
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!!!!!" });
});

app.listen(5000, () => {
  console.log("listening on port 5000");
});
