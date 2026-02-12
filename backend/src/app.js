const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Test route (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Telemedicine API is running");
});

module.exports = app;
