const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
      state,
      district,
      area,
      latitude,
      longitude,
    } = req.body;

    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Doctor already exists",
      });
    }

    const certificate = req.file?.filename || "";

    const hashedPassword = await bcrypt.hash(password, 10);

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
      state,
      district,
      area,
      latitude,
      longitude,
      certificate,
      status: "waiting", 
    });

    res.status(201).json({
      message: "Registration successful. Waiting for admin approval",
      doctor,
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.loginDoctor = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    console.log("LOGIN EMAIL:", email);

    const doctor = await Doctor.findOne({ email });

    console.log("FOUND DOCTOR:", doctor);

    if (!doctor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    
    if (!doctor.status || doctor.status.toLowerCase().trim() !== "approved") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: doctor._id, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      doctor: {
        _id: doctor._id,   
        name: doctor.name,
        email: doctor.email,
        status: doctor.status,
      },
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};