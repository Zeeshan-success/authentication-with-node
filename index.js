const express = require("express");
const cors = require("cors");
require('dotenv').config();
const loginRouter = require("./routes/Routes");
const app = express();
const {ConnectDatabase} = require("./connection");
const port = process.env.PORT || 8080;

ConnectDatabase(); // Connect to the database
app.use(cors());
app.use(express.json()); // Add this for JSON parsing

app.use('/', loginRouter);

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);