import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../../socket";

export default function DoctorVideoCall() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const jitsiRef = useRef(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    // Load Jitsi API
    if (!window.JitsiMeetExternalAPI) {
      alert("Jitsi Meet API not loaded!");
      return;
    }

    const domain = "meet.jit.si";
    const options = {
      roomName: `TeleMed-${appointmentId}`,
      parentNode: jitsiRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false },
      interfaceConfigOverwrite: { DEFAULT_REMOTE_DISPLAY_NAME: "Patient" },
    };

    const jitsi = new window.JitsiMeetExternalAPI(domain, options);
    setApi(jitsi);

    // Notify patient that doctor is in the room
    socket.emit("doctor-in-room", { appointmentId });

    // Listen for hangup
    jitsi.addEventListener("readyToClose", () => {
      jitsi.dispose();
      navigate("/doctor/dashboard");
    });

    return () => {
      jitsi.dispose();
    };
  }, [appointmentId, navigate]);

  // Handle patient hangup
  useEffect(() => {
    socket.on("end-call", (data) => {
      if (data.appointmentId === appointmentId) {
        alert("Patient ended the call.");
        api?.dispose();
        navigate("/doctor/dashboard");
      }
    });

    return () => socket.off("end-call");
  }, [api, appointmentId, navigate]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div ref={jitsiRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}