import React, { useState, useEffect } from "react";
import socket from "../socket";
import "./ChatBox.css";

export default function ChatBox({ user, usersList = [] }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ================= SOCKET =================
  useEffect(() => {
  socket.on("receive-message", (msg) => {
    setMessages((prev) => [...prev, msg]);
    socket.emit("message-seen", msg.id);
  });

  socket.on("typing", () => {
    setTyping(true);
    setTimeout(() => setTyping(false), 1500);
  });

  socket.on("online-users", (users) => {
    setOnlineUsers(users);
  });

  return () => {
    socket.off("receive-message");
    socket.off("typing");
    socket.off("online-users");
  };
}, []);



  // ================= SEND =================
  const send = () => {
  if (!message.trim() || !selectedUser) return;

  const msg = {
    id: Date.now(),
    message,
    sender: user.email,
    receiver: selectedUser.email,   
    status: "sent",
  };

  setMessages((prev) => [...prev, msg]);

  socket.emit("send-message", msg); 
  setMessage("");

  socket.emit("notification", {
  email: receiverEmail,
  message: "💬 New message received"
});
};


// ================= FILE SEND =================
const sendFile = (e) => {
  const file = e.target.files[0];
  if (!file || !selectedUser) return;

  const reader = new FileReader();

  reader.onload = () => {
    const msg = {
      id: Date.now(),
      file: reader.result, 
      sender: user.email,
      receiver: selectedUser.email,
      status: "sent",
    };

    socket.emit("send-message", msg);
    setMessages((prev) => [...prev, msg]);
  };

  reader.readAsDataURL(file);
};

  return (
    <div className="isolated-chat-system">

      {/* LEFT USERS LIST */}
      <div className="chat-users">
        {usersList.map((u, i) => (
          <div
            key={i}
            className={`chat-user ${selectedUser?.email === u.email ? "active" : ""}`}
            onClick={() => setSelectedUser(u)}
          >
            <div className="avatar">{u.name[0]}</div>

            <div>
              <p>{u.name}</p>

              {onlineUsers.includes(u.email) ? (
                <span className="online">🟢 Online</span>
              ) : (
                <span className="offline">Last seen {u.lastSeen || "recently"}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT CHAT */}
      <div className="chat-box">
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div className="chat-header">
              <h4>{selectedUser.name}</h4>

              {onlineUsers.includes(selectedUser.email) ? (
                <span className="online">🟢 Online</span>
              ) : (
                <span className="offline">Last seen recently</span>
              )}
            </div>

            {/* MESSAGES */}
            <div className="messages">
              {messages
                .filter(
                  (m) =>
                    m.sender === selectedUser.email ||
                    m.receiver === selectedUser.email
                )
                .map((m, i) => (
                  <div
                    key={i}
                    className={`message ${
                      m.sender === user.email ? "sent" : "received"
                    }`}
                  >
                    {m.message && <p>{m.message}</p>}

                        {m.file && (
                        <img src={m.file} alt="file" className="chat-img" />
                        )}
                  </div>
                ))}
            </div>

            {typing && <p className="typing">Typing...</p>}

            {/* INPUT */}
            <div className="input">
  <input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Type a message"
  />

  {/* ✅ ADD THIS */}
  <input type="file" onChange={sendFile} />

  <button onClick={send}>Send</button>
</div>
            
              
          </>
        ) : (
          <div className="no-chat">Select a user to start chat</div>
        )}
      </div>
    </div>
  );
}