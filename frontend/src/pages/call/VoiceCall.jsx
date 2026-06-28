import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./VoiceCall.css";

export default function VoiceCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const audioRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");
  const [muted, setMuted] = useState(false);

  
  const parts = roomId.split("-");
const caller = parts[0];
const receiver = parts[1];
const myEmail = JSON.parse(localStorage.getItem("patientAuth") || localStorage.getItem("doctorAuth"))?.email;

const targetEmail = myEmail === caller ? receiver : caller;

  useEffect(() => {
    initCall();

    return () => {
      peerRef.current?.close();
      socket.emit("end-call", { to: targetEmail });

      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
    };
  }, []);

  const initCall = async () => {
    try {
     
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      localStreamRef.current = stream;

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });

      peerRef.current = peer;

      
      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        audioRef.current.srcObject = event.streams[0];
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            to: targetEmail,
            candidate: event.candidate
          });
        }
      };


      socket.on("webrtc-offer", async ({ offer }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
          to: targetEmail,
          answer
        });

        setStatus("Connected");
      });

      socket.on("webrtc-answer", async ({ answer }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus("Connected");
      });

      socket.on("webrtc-ice-candidate", async ({ candidate }) => {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.log("ICE error", err);
        }
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        to: targetEmail,
        offer
      });

    } catch (err) {
      alert("❌ Microphone permission denied");
      navigate(-1);
    }
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = muted;
    setMuted(!muted);
  };

  const endCall = () => {
    peerRef.current?.close();
    socket.emit("end-call", { to: targetEmail });
    navigate(-1);
  };

  return (
    <div className="voice-call-container">

      <audio ref={audioRef} autoPlay />

      <div className="call-card">

        <div className="avatar">👤</div>

        <h2>Voice Call</h2>
        <p className="status">{status}</p>

        <div className="controls">

          <button
            className={`mute-btn ${muted ? "active" : ""}`}
            onClick={toggleMute}
          >
            {muted ? "🔇" : "🎤"}
          </button>

          <button className="end-btn" onClick={endCall}>
            📞 End
          </button>

        </div>

      </div>
    </div>
  );
}