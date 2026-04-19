const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");

const router = express.Router();

// ---------------------
// Patient Login Route
// ---------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login API hit");
console.log(req.body);

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        address: patient.address,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, gender, address } = req.body;

    console.log("Register API hit");
console.log(req.body);

    if (!name || !email || !phone || !password || !gender || !address){
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({
    name,
    email,
    phone,
    password: hashedPassword,
    gender,
    address,
  });

    const savedPatient = await newPatient.save();

    res.status(201).json({ message: "Patient registered successfully", patient: savedPatient });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

