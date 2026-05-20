const express = require("express");
const Appointment = require("../models/Appointment");

const router = express.Router();


// ===================================================
// TODAY + TOMORROW APPOINTMENTS
// FOR DOCTOR & PATIENT DASHBOARD
// ===================================================
router.get("/today/:userId", async (req, res) => {
  try {

    const today = new Date().toISOString().split("T")[0];

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    // FIND APPOINTMENTS
    const appointments = await Appointment.find({
      $or: [
        { doctorId: req.params.userId },
        { patientId: req.params.userId }
      ]
    }).sort({ date: 1 });

    // TODAY APPOINTMENTS
    const todayAppointments = appointments.filter(
      (a) => a.date === today
    );

    // TOMORROW APPOINTMENTS
    const tomorrowAppointments = appointments.filter(
      (a) => a.date === tomorrow
    );

    res.json({
      today: todayAppointments,
      tomorrow: tomorrowAppointments,
      all: appointments
    });

  } catch (err) {
    console.log("❌ TODAY ROUTE ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch appointments"
    });
  }
});


// ===================================================
// PATIENT NOTIFICATION DROPDOWN
// ===================================================
router.get("/notifications/:patientId", async (req, res) => {

  try {

    const today = new Date().toISOString().split("T")[0];

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    // PATIENT APPOINTMENTS
    const appointments = await Appointment.find({
      patientId: req.params.patientId
    }).sort({ date: 1 });

    // TODAY
    const todayAppointments = appointments.filter(
      (a) => a.date === today
    );

    // TOMORROW
    const tomorrowAppointments = appointments.filter(
      (a) => a.date === tomorrow
    );

    res.json({
      today: todayAppointments,
      tomorrow: tomorrowAppointments
    });

  } catch (err) {

    console.log("❌ NOTIFICATION ERROR:", err);

    res.status(500).json({
      message: "Notification fetch failed"
    });
  }
});

module.exports = router;