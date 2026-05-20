 const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true,unique: true, },
  password: { type: String, required: true },
  mobile: Number,
  gender: String,
  hospital: String,
  experience: { type: Number, default: 1 },
  qualification: String,
  specialization: String,
  licenseNo: String,
  state: String,
  district: String,
  area: String,
  certificate: String,

  fee: { type: Number, default: 200 },
  rating: { type: Number, default: 4.5 },
  location: { type: String, default: "Pune" },
  profileImage: String,

  role: {
    type: String,
    default: "doctor",
  },

  status: {
    type: String,
    enum: ["waiting", "approved","rescheduled"],   
    default: "waiting",              
  },

 profileImage: String,
  online: { type: Boolean, default: false },

  otp: String,
  otpExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);