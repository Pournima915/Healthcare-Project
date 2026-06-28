const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("Telemedicine API is running");
});

module.exports = app;
