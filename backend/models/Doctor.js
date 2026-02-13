const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    mobile: { type: String, required: true },

    gender: { type: String, required: true },

    hospital: { type: String, required: true },

    experience: { type: Number, required: true },

    qualification: { type: String, required: true },

    specialization: { type: String, required: true },

    licenseNo: { type: String, required: true },

    certificate: { type: String }, // file path (optional)

    role: {
      type: String,
      default: "doctor",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
