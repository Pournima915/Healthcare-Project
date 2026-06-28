const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor"); 

const {
  getAllDoctors,
  getAllPatients,
  updateDoctorStatus,
  updatePatientStatus,
  deleteDoctor,
} = require("../controllers/adminController");

router.get("/doctors", getAllDoctors);
router.put("/doctors/:id", updateDoctorStatus);
router.delete("/doctors/:id", deleteDoctor);

router.get("/patients", getAllPatients);
router.put("/patients/:id", updatePatientStatus);

router.get("/appointments", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    let appointments = await Appointment.find({
      date: { $gte: today }, 
    }).sort({ createdAt: -1 });

    
    const fixedAppointments = await Promise.all(
      appointments.map(async (a) => {

        if (!a.doctorName && a.doctorId) {
          const doctor = await Doctor.findById(a.doctorId);
          if (doctor) {
            a.doctorName = doctor.name;
          }
        }

        
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