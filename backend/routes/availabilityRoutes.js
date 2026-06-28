const express = require("express");
const router = express.Router();
const Availability = require("../models/Availability");

router.post("/", async (req, res) => {
  try {
    const { doctorEmail, date, slots } = req.body;

    if (!doctorEmail || !date || !slots) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await Availability.findOneAndDelete({ doctorEmail, date });

    const newData = new Availability({
      doctorEmail,
      date,
      slots,
    });

    await newData.save();

    res.json({ message: "Saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving availability" });
  }
});

router.get("/:doctorEmail/:date", async (req, res) => {
  try {
    const { doctorEmail, date } = req.params;

    const data = await Availability.findOne({ doctorEmail, date });

    res.json(data || { slots: [] });

  } catch (err) {
    res.status(500).json({ message: "Error fetching availability" });
  }
});

module.exports = router;