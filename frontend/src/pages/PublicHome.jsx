import { Link } from "react-router-dom";
import { useEffect } from "react";

const PublicHome = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Telemedicine Platform</h1>
      <p>Select your role</p>

      <Link to="/patient/login">Patient Login</Link><br />
      <Link to="/doctor/login">Doctor Login</Link><br />
      <Link to="/admin/login">Admin Login</Link>
    </div>
  );
};

export default PublicHome;
