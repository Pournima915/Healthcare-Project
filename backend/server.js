require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes"); // ✅ ADD THIS

const app = express();   // ✅ CREATE APP FIRST

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/doctor", doctorRoutes);


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ✅ Use Routes AFTER app is created
app.use("/api/patient", patientRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

