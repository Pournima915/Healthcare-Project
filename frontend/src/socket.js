import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  reconnection: true,
});



socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});



socket.on("reconnect_attempt", () => {
  console.log("🔄 Reconnecting...");
});

// ❌ Disconnected
socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});


export default socket;