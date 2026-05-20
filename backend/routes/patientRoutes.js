const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Patient = require("../models/Patient");

const router = express.Router();



const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// UPDATE PROFILE
router.put("/update-profile", async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware

    const updated = await Patient.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});


/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login API hit");
    console.log(req.body);

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

        // ❗ BLOCK LOGIN IF BLOCKED
    if (patient.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked by admin"
      });
    }

    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      patient: {
      _id: patient._id,   
      name: patient.name,
      email: patient.email,
      mobile: patient.mobile,
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


/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password, gender, address } = req.body;

    console.log("Register API hit");
    console.log(req.body);

    if (!name || !email || !mobile || !password || !gender || !address) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingPatient = await Patient.findOne({ email });

    if (existingPatient) {
      return res.status(400).json({
        message: "Patient already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      name,
      email,
      mobile, 
      password: hashedPassword,
      gender,
      address,
    });

    const savedPatient = await newPatient.save();

    res.status(201).json({
      message: "Patient registered successfully",
      patient: savedPatient,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
