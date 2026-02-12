import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/doctor/login");
      return;
    }

    // Call protected backend route
    axios
      .get("http://localhost:5000/api/doctor/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDoctor(res.data.user);
      })
      .catch((err) => {
        console.log("Access denied", err);
        localStorage.removeItem("token");
        localStorage.removeItem("doctorAuth");
        navigate("/doctor/login");
      });
  }, [navigate]);

  if (!doctor) return <div className="loading">Loading...</div>;

  return (
    <div className="doctor-dashboard">
      <aside className="sidebar">
        <h2 className="logo">TeleMed</h2>
        <ul>
          <li onClick={() => setActiveTab("dashboard")}>Dashboard</li>
          <li onClick={() => setActiveTab("profile")}>Profile</li>

          <li
            className="logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("doctorAuth");
              navigate("/doctor/login");
            }}
          >
            Logout
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === "dashboard" && (
          <>
            <h2>Welcome Doctor</h2>
            <p>Your ID: {doctor.id}</p>
            <p>Your Role: {doctor.role}</p>
          </>
        )}

        {activeTab === "profile" && (
          <>
            <h3>Doctor Profile</h3>
            <p><strong>ID:</strong> {doctor.id}</p>
            <p><strong>Role:</strong> {doctor.role}</p>
          </>
        )}
      </main>
    </div>
  );
}
