const Appointment = require("../models/Appointment");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, startTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60000);

    const clash = await Appointment.findOne({
      doctor: doctorId,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (clash) {
      return res.status(400).json({
        message: "Slot booked. Select another time."
      });
    }

    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: req.user.id,
      startTime: start,
      endTime: end
    });

    res.status(201).json(appointment);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
