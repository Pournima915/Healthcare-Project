require("dotenv").config();
const express = require("express");
const cors = require("cors");

const http = require("http");
const { Server } = require("socket.io");

const patientRoutes = require("./routes/patientRoutes");



const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
// 👇 VERY IMPORTANT LINE
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

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
