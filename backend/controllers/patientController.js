const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, mobile, gender, address } = req.body;

    if (!name || !email || !password || !mobile || !gender || !address) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const existing = await Patient.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Auto increment ID
    const last = await Patient.findOne().sort({ patientId: -1 });
    const patientId = last ? last.patientId + 1 : 1;

    const hashed = await bcrypt.hash(password, 10);

    await Patient.create({
      patientId,
      name,
      email,
      password: hashed,
      mobile,
      gender,
      address,
    });

    res.status(201).json({
      message: "Patient registered successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= LOGIN ================= */
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, patient.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: patient._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      patient: {
        name: patient.name,
        email: patient.email,
        mobile: patient.mobile,
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
