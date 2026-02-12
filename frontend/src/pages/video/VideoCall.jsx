import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
import "./VideoCall.css";

// const socket = io("http://localhost:5000");

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoCall({ role, userName, roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.emit("join-room", roomId);

    peerRef.current = new RTCPeerConnection(rtcConfig);

    peerRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    socket.on("offer", async (offer) => {
      await peerRef.current.setRemoteDescription(offer);
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
      setConnected(true);
    });

    socket.on("answer", async (answer) => {
      await peerRef.current.setRemoteDescription(answer);
      setConnected(true);
    });

    socket.on("ice-candidate", async (candidate) => {
      await peerRef.current.addIceCandidate(candidate);
    });

    return () => socket.disconnect();
  }, [roomId]);

  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    streamRef.current = stream;
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((t) =>
      peerRef.current.addTrack(t, stream)
    );
  };

  const startCall = async () => {
    await startMedia();
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
  };

  const joinCall = async () => {
    await startMedia();
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();
    window.location.reload();
  };

  return (
    <div className="meet-container">
      <h2>🩺 Live Consultation</h2>
      <p className="role-label">
        {role === "doctor" ? "Doctor" : "Patient"}: {userName}
      </p>

      <div className="videos">
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>

      <div className="controls">
        {!connected && role === "doctor" && (
          <button className="primary" onClick={startCall}>
            ▶ Start Call
          </button>
        )}

        {!connected && role === "patient" && (
          <button className="primary" onClick={joinCall}>
            🎥 Join Call
          </button>
        )}

        {connected && (
          <button className="danger" onClick={endCall}>
            ❌ End Call
          </button>
        )}
      </div>
    </div>
  );
}
