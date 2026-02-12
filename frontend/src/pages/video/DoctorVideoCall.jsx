import { useEffect } from "react";

export default function DoctorVideoCall() {
  useEffect(() => {
    const domain = "meet.jit.si";
    const options = {
      roomName: "TeleMed-Consultation",
      width: "100%",
      height: "100%",
      parentNode: document.getElementById("jitsi-container"),
      userInfo: {
        displayName: "Doctor"
      }
    };

    new window.JitsiMeetExternalAPI(domain, options);
  }, []);

  return (
    <div style={{ height: "100vh", background: "#020617" }}>
      <div id="jitsi-container" style={{ height: "100%" }} />
    </div>
  );
}
