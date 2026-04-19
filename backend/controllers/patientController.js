
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, mobile, gender, address } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existing = await Patient.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      mobile,
      gender,
      address,
      });

    res.status(201).json({ message: "Patient registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existing = await Patient.findOne({ email: normalizedEmail });
    if (!patient) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: patient._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


