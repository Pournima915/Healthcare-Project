require("dotenv").config();
require("./utils/cronJobs");

const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cron = require("node-cron");
const { sendEmail } = require("./utils/sendEmail");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.set("io", io);

const Appointment = require("./models/Appointment");
const Doctor = require("./models/Doctor");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

const socketHandler = require("./socket");
socketHandler(io);


const notificationRoutes = require("./routes/notificationRoutes");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/availability", availabilityRoutes);

app.use("/api/appointment", notificationRoutes);

let onlineDoctors = {};

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("doctor-online", async (email) => {
    if (!email) return;
    const normalized = email.toLowerCase().trim();

    try {
      const doctor = await Doctor.findOne({ email: normalized });
      if (!doctor || doctor.status !== "approved") return;

      onlineDoctors[normalized] = {
        socketId: socket.id,
        name: doctor.name,
        email: doctor.email,
      };

      socket.join(normalized);
      io.emit("online-doctors", Object.values(onlineDoctors));
    } catch (err) {
      console.log("❌ Socket doctor-online error:", err);
    }
  });

  socket.on("doctor-offline", (email) => {
    if (!email) return;
    delete onlineDoctors[email.toLowerCase()];
    io.emit("online-doctors", Object.values(onlineDoctors));
  });

  socket.on("patient-online", (email) => {
    if (email) socket.join(email.toLowerCase());
  });

  socket.on("call-doctor", ({ to, from, patientName, appointmentId }) => {
    const doc = onlineDoctors[to?.toLowerCase()];
    if (doc) {
      io.to(doc.socketId).emit("incoming-call", {
        patientEmail: from,
        patientName,
        appointmentId,
      });
    }
  });

  socket.on("call-accepted", ({ to, appointmentId }) => {
    io.to(to.toLowerCase()).emit("call-accepted", { appointmentId });
  });

  socket.on("call-rejected", ({ to }) => {
    io.to(to.toLowerCase()).emit("call-rejected");
  });

  socket.on("notify", ({ email, message }) => {
    if (email) {
      io.to(email.toLowerCase()).emit("notification", { message });
    }
  });

  socket.on("disconnect", () => {
    for (let doc in onlineDoctors) {
      if (onlineDoctors[doc].socketId === socket.id) delete onlineDoctors[doc];
    }
    io.emit("online-doctors", Object.values(onlineDoctors));
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ DB ERROR:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("🚀 Backend Running");
});

cron.schedule("0 9 * * *", async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const appts = await Appointment.find({ date: dateStr });

    for (const a of appts) {
      const msg = "Reminder: Appointment Tomorrow";

      io.to(a.patientEmail?.toLowerCase()).emit("notification", { message: msg });
      io.to(a.doctorEmail?.toLowerCase()).emit("notification", { message: msg });
    }

    console.log("⏰ Reminder sent");
  } catch (err) {
    console.log("❌ CRON ERROR:", err);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));