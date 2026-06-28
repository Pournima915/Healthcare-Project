const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const xss = require("xss-clean");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());

app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);


<div className="cards-grid">

  <div className="card pending">
    <h3>🕒 {stats.pending}</h3>
    <p>Pending</p>
  </div>

  <div className="card accepted">
    <h3>✅ {stats.accepted}</h3>
    <p>Accepted</p>
  </div>

  <div className="card rescheduled">
    <h3>🔁 {stats.rescheduled}</h3>
    <p>Rescheduled</p>
  </div>

</div>

useEffect(() => {
  const doc = localStorage.getItem("doctorAuth");
  if (doc) setDoctor(JSON.parse(doc));
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    loadAppointments(doctor.email);
  }, 10000); 

  return () => clearInterval(interval);
}, [doctor]);

module.exports = app;
