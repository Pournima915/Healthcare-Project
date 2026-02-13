import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VideoCall.css";

export default function PatientVideoCall() {
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const domain = "meet.jit.si";

    const options = {
      roomName: "TeleMed-Consultation",
      width: "100%",
      height: "100%",
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: "Patient",
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    api.addEventListener("videoConferenceJoined", () => {
      setLoading(false);
    });

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      api.dispose();
      clearInterval(timer);
    };
  }, []);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="video-page">

      <div className="video-header">
        <h2>🩺 TeleMed Live Consultation</h2>
        <div className="call-info">
          <span>👤 Patient</span>
          <span>⏱ {formatTime()}</span>
          <button onClick={() => navigate(-1)}>Leave</button>
        </div>
      </div>

      {loading && <div className="loader">Connecting to doctor...</div>}

      <div className="video-container" ref={jitsiContainerRef} />

    </div>
  );
}
