const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { sendEmail } = require("../utils/sendEmail");


const { login } = require("../controllers/authController");

router.post("/login", login);


router.post("/send-otp", async (req, res) => {
  const { email, role } = req.body;

  const Model = role === "doctor" ? Doctor : Patient;

  const user = await Model.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save();

  await sendEmail(email, "OTP for Reset Password", `Your OTP is ${otp}`);

  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp, role } = req.body;

  const Model = role === "doctor" ? Doctor : Patient;

  const user = await Model.findOne({ email });

  if (!user || user.otp != otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  res.json({ message: "OTP verified" });
});

router.post("/reset-password", async (req, res) => {
  const { email, password, role } = req.body;

  const Model = role === "doctor" ? Doctor : Patient;

  const user = await Model.findOne({ email });

  user.password = password; 
  user.otp = null;

  await user.save();

  res.json({ message: "Password updated" });
});

module.exports = router;