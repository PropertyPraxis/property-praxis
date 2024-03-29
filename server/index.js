const express = require("express");
const app = express();
const cors = require("cors");
const mountRoutes = require("./routes"); //index.js
const morgan = require("morgan");
const helmet = require("helmet");

//cors
app.use(cors());

//general security
app.use(helmet());
app.disable("X-powered-by");

//logging
app.use(morgan("combined"));

//mount routes
mountRoutes(app);

app.listen(5000, () => {
  console.log("Listening on port 5000...");
});
