const express = require("express");
const router = express.Router();
const axios = require("axios");

// Forward request to Flask Symptom Checker
router.post("/check", async (req, res) => {
  try {
    const { symptoms } = req.body;

    const response = await axios.post(
      "http://127.0.0.1:5001/predict",
      {
        symptoms: symptoms,
        language: "en"
      }
    );

    res.json(response.data);

  } catch (err) {
    console.log("❌ AI Route Error:", err.message);

    res.status(500).json({
      message: "Unable to connect to Symptom Checker service"
    });
  }
});

module.exports = router;