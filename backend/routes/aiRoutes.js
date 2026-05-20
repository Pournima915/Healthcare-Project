const express = require("express");
const router = express.Router();

const { predict } = require("../ml/symptomModel");

router.post("/check", (req, res) => {
  try {
    const { symptoms } = req.body;

    const result = predict(symptoms);

    res.json({ result });
  } catch (err) {
    console.log("❌ AI Route Error:", err);
    res.status(500).json({ message: "AI error" });
  }
});

module.exports = router;