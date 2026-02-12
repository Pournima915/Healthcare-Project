import express from "express";

const router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Book appointment
 */
router.post("/", (req, res) => {
  const appointment = req.body;

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
});

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 */
router.get("/", (req, res) => {
  res.json([]);
});

export default router;
