const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const bcrypt = require("bcryptjs");

const hashed = await bcrypt.hash(password, 12);

exports.login = async (req, res) => {
  const { email, password } = req.body;

  let user =
    (await Patient.findOne({ email, password })) ||
    (await Doctor.findOne({ email, password }));

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    role: user.role,
    name: user.name,
  });
};
