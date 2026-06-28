module.exports = (io) => {

  const onlineUsers = {}; 

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    socket.on("doctor-online", (email) => {
      onlineUsers[email] = socket.id;
      socket.join(email);
    });

    socket.on("patient-online", (email) => {
      onlineUsers[email] = socket.id;
      socket.join(email);
    });

    socket.on("notify", (data) => {
      io.to(data.email).emit("notification", data);
    });

    
    socket.on("send-message", (msg) => {
      const receiverSocket = onlineUsers[msg.receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", {
          ...msg,
          status: "delivered"
        });

       
        io.to(receiverSocket).emit("notification", {
          type: "chat",
          message: `New message from ${msg.senderName}`,
          sender: msg.sender
        });
      }
    });

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

socket.on("end-call", ({ to }) => {
  const receiverSocket = onlineUsers[to];
  if (receiverSocket) {
    io.to(receiverSocket).emit("end-call");
  }
});

socket.on("webrtc-offer", ({ to, offer }) => {
  io.to(onlineUsers[to]).emit("webrtc-offer", { offer });
});

socket.on("webrtc-answer", ({ to, answer }) => {
  io.to(onlineUsers[to]).emit("webrtc-answer", { answer });
});

socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
  io.to(onlineUsers[to]).emit("webrtc-ice-candidate", { candidate });
});

    socket.on("end-call", ({ to }) => {
      const receiverSocket = onlineUsers[to];
      if (receiverSocket) {
        io.to(receiverSocket).emit("call-ended");
      }
    });

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