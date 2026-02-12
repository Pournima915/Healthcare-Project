

const express = require("express");
const router = express.Router();
const {
  registerPatient,
  loginPatient,
} = require("../controllers/patientController");

router.post("/register", registerPatient);
router.post("/login", loginPatient);

module.exports = router;


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(400).json({ message: "Patient not found" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.status(200).json({ patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
