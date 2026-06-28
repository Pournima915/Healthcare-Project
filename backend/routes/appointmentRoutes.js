const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability"); 
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      patientEmail,
      patientName,
      doctorEmail,
      doctorName,
      date,
      startTime,
      endTime,
      reason,
    } = req.body;

    const io = req.app.get("io");

    if (!patientId || !doctorId || !patientEmail || !doctorEmail || !date || !startTime || !endTime || !doctorName) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existing = await Appointment.findOne({
      doctorEmail,
      date,
      startTime,
      status: { $in: ["pending", "accepted", "rescheduled"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "Slot already booked or rescheduled"
      });
    }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      patientEmail: patientEmail.trim().toLowerCase(),
      patientName,
      doctorEmail: doctorEmail.trim().toLowerCase(),
      doctorName,
      date,
      startTime,
      endTime,
      reason,
      status: "pending",
    });

    await newAppointment.save();


    if (io) {
  io.to(newAppointment.doctorEmail).emit("notification", {
    message: `📥 New appointment from ${newAppointment.patientName}`
  });
}
    res.status(201).json(newAppointment);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/patient/:email", async (req, res) => {
  try {
    const data = await Appointment.find({
      patientEmail: req.params.email,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/doctor/:email", async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const now = new Date();

    const allAppointments = await Appointment.find();

    const doctorAppointments = allAppointments.filter(a =>
      a.doctorEmail?.trim().toLowerCase() === email
    );

    const futureAppointments = doctorAppointments.filter(a => {
      if (!a.date || !a.startTime) return false;
      return new Date(`${a.date}T${a.startTime}`) >= now;
    });

    console.log("📥 Doctor Email:", email);
    console.log("📊 Total Found:", doctorAppointments.length);
    console.log("📅 Future:", futureAppointments.length);

    res.json(futureAppointments);

  } catch (err) {
    console.log("❌ Doctor Fetch Error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/available/:email/:date", async (req, res) => {
  try {
    const { email, date } = req.params;

    const appointments = await Appointment.find({
      doctorEmail: email,
      date: date,
      status: { $in: ["pending", "accepted", "rescheduled"] }
    });

    const booked = appointments.map(a => a.startTime);

    const Availability = require("../models/Availability");

    const availability = await Availability.findOne({
      doctorEmail: email,
      date: date,
    });

    let blocked = [];

    if (availability) {
      blocked = availability.slots
        .filter(s => s.status === "blocked")
        .map(s => s.time);
    }

    res.json({
      booked,
      blocked   
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching slots" });
  }
});

router.get("/stats/:email", async (req, res) => {
  try {
    const data = await Appointment.find({
      patientEmail: req.params.email,
    });

    const stats = {
      pending: data.filter(a => a.status === "pending").length,
      accepted: data.filter(a => a.status === "accepted").length,
      rescheduled: data.filter(a => a.status === "rescheduled").length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/approve/:id", async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );

    await sendEmail(
      appt.patientEmail,
      "Appointment Approved",
      `Your appointment on ${appt.date} at ${appt.startTime} is approved.`
    );

    res.json({ message: "✅ Approved + Email Sent" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error approving" });
  }
});

router.put("/reschedule/:id", async (req, res) => {
  try {
    const { date, startTime } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const today = new Date();
    const selectedDate = new Date(date);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot reschedule to past date",
      });
    }

    const [hour, min] = startTime.split(":");
    const endTime = `${String(parseInt(hour) + 1).padStart(2, "0")}:${min}`;

    const clash = await Appointment.findOne({
      doctorEmail: appointment.doctorEmail,
      date,
      startTime,
      _id: { $ne: req.params.id },
      status: { $in: ["pending", "accepted", "rescheduled"] }
    });

    if (clash) {
      return res.status(400).json({
        message: "Slot already booked",
      });
    }

    await Appointment.findByIdAndUpdate(req.params.id, {
      date,
      startTime,
      endTime,
      status: "rescheduled",
    });

    res.json({ message: "✅ Rescheduled successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error rescheduling" });
  }
});

router.put("/complete/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, {
      status: "completed"
    });

    res.json({ message: "Completed ✅" });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

router.get("/today/:email", async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const data = await Appointment.find({
      $or: [
        { patientEmail: email },
        { doctorEmail: email }
      ]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Error fetching today data" });
  }
});

module.exports = router;