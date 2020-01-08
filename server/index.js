const express = require("express");
const { Client } = require('pg')
const app = express();

const client = new Client({
  user: "user",
  host: "postgres",
  database: "db",
  password: "pass",
});
client.connect();
client.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  client.end();
});


app.get('/', (req, res)=>{
    res.send("Hello World!")
})

app.listen(5000, ()=>{
    console.log("listening on port 5000")
})