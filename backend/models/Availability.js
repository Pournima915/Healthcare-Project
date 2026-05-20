const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  doctorEmail: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  slots: [
    {
      time: String,
      status: {
        type: String,
        enum: ["available", "blocked"],
        default: "available",
      },
    },
  ],
});

module.exports = mongoose.model("Availability", availabilitySchema);