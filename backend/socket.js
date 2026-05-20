module.exports = (io) => {

  const onlineUsers = {}; // email -> socketId

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    // ================= ONLINE =================
    socket.on("doctor-online", (email) => {
      onlineUsers[email] = socket.id;
      socket.join(email);
    });

    socket.on("patient-online", (email) => {
      onlineUsers[email] = socket.id;
      socket.join(email);
    });

    // ================= NOTIFICATIONS =================
    socket.on("notify", (data) => {
      io.to(data.email).emit("notification", data);
    });

    // ================= CHAT =================
    socket.on("send-message", (msg) => {
      const receiverSocket = onlineUsers[msg.receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", {
          ...msg,
          status: "delivered"
        });

        // 🔔 ALSO SEND NOTIFICATION
        io.to(receiverSocket).emit("notification", {
          type: "chat",
          message: `New message from ${msg.senderName}`,
          sender: msg.sender
        });
      }
    });

    // ================= CALL START =================
  
    // ================= CALL SYSTEM =================
socket.on("call-doctor", (data) => {
  const receiverSocket = onlineUsers[data.to];

  if (receiverSocket) {
    io.to(receiverSocket).emit("incoming-call", data);
  }
});

socket.on("call-accepted", (data) => {
  const receiverSocket = onlineUsers[data.to];
  if (receiverSocket) {
    io.to(receiverSocket).emit("call-accepted", data);
  }
});

socket.on("call-rejected", (data) => {
  const receiverSocket = onlineUsers[data.to];
  if (receiverSocket) {
    io.to(receiverSocket).emit("call-rejected");
  }
});

// ✅ ONLY ONE END CALL
socket.on("end-call", ({ to }) => {
  const receiverSocket = onlineUsers[to];
  if (receiverSocket) {
    io.to(receiverSocket).emit("end-call");
  }
});

// ================= WEBRTC =================
socket.on("webrtc-offer", ({ to, offer }) => {
  io.to(onlineUsers[to]).emit("webrtc-offer", { offer });
});

socket.on("webrtc-answer", ({ to, answer }) => {
  io.to(onlineUsers[to]).emit("webrtc-answer", { answer });
});

socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
  io.to(onlineUsers[to]).emit("webrtc-ice-candidate", { candidate });
});

    // ================= END CALL =================
    socket.on("end-call", ({ to }) => {
      const receiverSocket = onlineUsers[to];
      if (receiverSocket) {
        io.to(receiverSocket).emit("call-ended");
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);

      for (let email in onlineUsers) {
        if (onlineUsers[email] === socket.id) {
          delete onlineUsers[email];
        }
      }
    });

  });
};