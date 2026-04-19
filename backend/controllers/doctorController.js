const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/*
===========================
Register Doctor
===========================
*/
exports.registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      gender,
      hospital,
      experience,
      qualification,
      specialization,
      licenseNo,
    } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
      hospital,
      experience,
      qualification,
      specialization,
      licenseNo,
      role: "doctor",
      status: "pending",
    });

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*
===========================
Login Doctor
===========================
*/
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (doctor.status !== "approved") {
      return res.status(403).json({ message: "Doctor not approved yet" });
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        role: doctor.role,
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
        status: doctor.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
