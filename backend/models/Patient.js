const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
{
  patientId: {
    type: Number,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    required: true
  },

  gender: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },
  
  status: {
  type: String,
  enum: ["active", "blocked"],
  default: "active"
},

},
{ timestamps: true }
);


patientSchema.pre("save", async function(next) {

  if (this.patientId) return next();

  const lastPatient = await mongoose
    .model("Patient")
    .findOne({})
    .sort({ patientId: -1 });

  this.patientId = lastPatient ? lastPatient.patientId + 1 : 1;

  next();
});

module.exports = mongoose.model("Patient", patientSchema);
