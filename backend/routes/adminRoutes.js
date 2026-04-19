const express = require("express");
const router = express.Router();

const {
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  updateDoctorStatus,
  updatePatientStatus,
  deleteDoctor,
} = require("../controllers/adminController");

// Doctors
router.get("/doctors", getAllDoctors);
router.put("/doctors/:id", updateDoctorStatus);
router.delete("/doctors/:id", deleteDoctor);

// Patients
router.get("/patients", getAllPatients);
router.put("/patients/:id", updatePatientStatus);

// Appointments
router.get("/appointments", getAllAppointments);

module.exports = router;
