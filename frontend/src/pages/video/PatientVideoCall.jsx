import { useEffect } from "react";

export default function PatientVideoCall() {
  useEffect(() => {
    const domain = "meet.jit.si";
    const options = {
      roomName: "TeleMed-Consultation",
      width: "100%",
      height: "100%",
      parentNode: document.getElementById("jitsi-container"),
      userInfo: {
        displayName: "Patient"
      }
    };

    new window.JitsiMeetExternalAPI(domain, options);
  }, []);

  return (
    <div style={{ height: "100vh", background: "#0f172a" }}>
      <div id="jitsi-container" style={{ height: "100%" }} />
    </div>
  );
}
