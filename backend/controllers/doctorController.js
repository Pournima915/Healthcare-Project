const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/*
=====================================
Doctor Registration
=====================================
*/
exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor (default status pending)
    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      role: "doctor",
      status: "pending"   // you can change logic later
    });

    res.status(201).json({ message: "Doctor registered successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*
=====================================
Doctor Login
=====================================
*/
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check approval
    if (doctor.status !== "approved") {
      return res.status(403).json({ message: "Doctor not approved yet" });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: doctor._id,
        role: "doctor"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        status: doctor.status
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
