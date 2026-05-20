const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor"); // ✅ ADD THIS

const {
  getAllDoctors,
  getAllPatients,
  updateDoctorStatus,
  updatePatientStatus,
  deleteDoctor,
} = require("../controllers/adminController");

// ================= DOCTORS =================
router.get("/doctors", getAllDoctors);
router.put("/doctors/:id", updateDoctorStatus);
router.delete("/doctors/:id", deleteDoctor);

// ================= PATIENTS =================
router.get("/patients", getAllPatients);
router.put("/patients/:id", updatePatientStatus);

// ================= APPOINTMENTS =================
router.get("/appointments", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    let appointments = await Appointment.find({
      date: { $gte: today }, // ✅ REMOVE PAST
    }).sort({ createdAt: -1 });

    // ================= FIX OLD DATA =================
    const fixedAppointments = await Promise.all(
      appointments.map(async (a) => {

        // ✅ FIX DOCTOR NAME
        if (!a.doctorName && a.doctorId) {
          const doctor = await Doctor.findById(a.doctorId);
          if (doctor) {
            a.doctorName = doctor.name;
          }
        }

        // ✅ FIX TIME SLOT (for old records)
        if (!a.startTime || !a.endTime) {
          const created = new Date(a.createdAt);

          const hour = created.getHours().toString().padStart(2, "0");

          a.startTime = `${hour}:00`;
          a.endTime = `${parseInt(hour) + 1}:00`;
        }

        return {
          _id: a._id,
          patientName: a.patientName,
          patientEmail: a.patientEmail,
          doctorEmail: a.doctorEmail,
          doctorName: a.doctorName,
          date: a.date,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          reason: a.reason,
        };
      })
    );

    // ✅ SORT (latest → oldest)
    fixedAppointments.sort((a, b) => {
      const A = new Date(`${a.date} ${a.startTime}`);
      const B = new Date(`${b.date} ${b.startTime}`);
      return B - A;
    });

    res.json(fixedAppointments);

  } catch (err) {
    console.log("❌ ADMIN APPOINTMENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;