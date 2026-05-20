const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {

    
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    patientEmail: {
      type: String,
      required: true,
    },

    doctorName: {
    type: String,
    required: true,
    default: "Unknown Doctor", 
    },
   
    patientName: {
      type: String,
    },

    doctorEmail: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
    },

      status: {
        type: String,
        enum: ["pending", "accepted", "rescheduled", "completed"], 
        default: "pending",
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);