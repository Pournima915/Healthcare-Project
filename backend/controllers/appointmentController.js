const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");

// ================= BOOK =================
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorEmail, patientEmail, patientName, date, time } = req.body;

    // ✅ CHECK BLOCKED SLOT
    const availability = await Availability.findOne({
      doctorEmail,
      date,
    });

    if (availability) {
      const slot = availability.slots.find(s => s.time === time);

      if (slot && slot.status === "blocked") {
        return res.status(400).json({
          message: "Doctor unavailable at this time ❌",
        });
      }
    }

    // ✅ CHECK DOUBLE BOOKING
    const clash = await Appointment.findOne({
      doctorEmail,
      date,
      startTime: time,
    });

    if (clash) {
      return res.status(400).json({
        message: "Slot already booked ❌",
      });
    }

    const endTime =
      (parseInt(time.split(":")[0]) + 1)
        .toString()
        .padStart(2, "0") + ":00";

    const appointment = await Appointment.create({
      doctorEmail,
      patientEmail,
      patientName,
      date,
      startTime: time,
      endTime,
      status: "pending",
    });

    res.json(appointment);

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

// ================= PATIENT =================
exports.getPatientAppointments = async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const data = await Appointment.find({
      patientEmail: email
    }).sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DOCTOR =================
exports.getDoctorAppointments = async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const data = await Appointment.find({
      doctorEmail: email
    }).sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= APPROVE =================
exports.approveAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, {
      status: "accepted"
    });

    res.json({ message: "Approved" });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

// ================= AVAILABLE SLOTS =================
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorEmail, date } = req.params;

    const cleanDoctor = doctorEmail.trim().toLowerCase();

    const booked = await Appointment.find({
      doctorEmail: cleanDoctor,
      date
    });

    const bookedTimes = booked.map(a => a.startTime);

    // ✅ GET AVAILABILITY
    const availability = await Availability.findOne({
      doctorEmail: cleanDoctor,
      date
    });

    let blockedTimes = [];

    if (availability) {
      blockedTimes = availability.slots
        .filter(s => s.status === "blocked")
        .map(s => s.time);
    }

    const allSlots = [
      "09:00", "10:00", "11:00", "12:00",
      "14:00", "15:00", "16:00", "17:00"
    ];

    const available = allSlots.filter(
      t => !bookedTimes.includes(t) && !blockedTimes.includes(t)
    );

    res.json({
      available,
      booked: bookedTimes,
      blocked: blockedTimes // 🔥 NEW
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching slots" });
  }
};

// ================= RESCHEDULE =================
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time, doctorEmail } = req.body;

    // ✅ CHECK BLOCKED SLOT
    const availability = await Availability.findOne({
      doctorEmail,
      date,
    });

    if (availability) {
      const slot = availability.slots.find(s => s.time === time);

      if (slot && slot.status === "blocked") {
        return res.status(400).json({
          message: "Doctor unavailable ❌",
        });
      }
    }

    const clash = await Appointment.findOne({
      doctorEmail,
      date,
      startTime: time,
      _id: { $ne: req.params.id },
    });

    if (clash) {
      return res.status(400).json({
        message: "Slot already booked ❌",
      });
    }

    const endTime =
      (parseInt(time.split(":")[0]) + 1)
        .toString()
        .padStart(2, "0") + ":00";

    await Appointment.findByIdAndUpdate(req.params.id, {
      date,
      startTime: time,
      endTime,
      status: "rescheduled",
    });

    res.json({ message: "Rescheduled ✅" });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};