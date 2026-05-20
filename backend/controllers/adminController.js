const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

/* ✅ Get All Doctors */
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    console.log("GET DOCTORS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✅ Update Doctor Status */
exports.updateDoctorStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status?.toLowerCase() || "approved" }, // ✅ FIX
      { new: true }
    );
    res.json(doctor);
  } catch (err) {
    console.log("UPDATE DOCTOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ❌ Delete Doctor */
exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.log("DELETE DOCTOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✅ Get All Patients */
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.log("GET PATIENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✅ Update Patient Status */
exports.updatePatientStatus = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(patient);
  } catch (err) {
    console.log("UPDATE PATIENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✅ Get All Appointments (FIXED) */
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .select(
        "patientName patientEmail doctorEmail date startTime endTime status reason"
      )
      .sort({ createdAt: -1 });

    res.json(appointments);

  } catch (err) {
    console.log("GET APPOINTMENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};