import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBars,
  FaHome,
  FaVideo,
} from "react-icons/fa";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  /* Auth Protection */
  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctorAuth");

    if (!storedDoctor) {
      navigate("/doctor/login");
      return;
    }

    setDoctor(JSON.parse(storedDoctor));
  }, [navigate]);

  /* Load Appointment Stats */
  useEffect(() => {
    if (!doctor) return;

    const appointments =
      JSON.parse(localStorage.getItem("appointments")) || [];

    const myAppointments = appointments.filter(
      (a) => a.doctorEmail === doctor.email
    );

    const result = { pending: 0, accepted: 0, rejected: 0 };

    myAppointments.forEach((a) => {
      if (result[a.status] !== undefined) result[a.status]++;
    });

    setStats(result);
  }, [doctor]);

const logout = () => {
  localStorage.removeItem("doctorAuth");
  localStorage.removeItem("doctorToken");
  navigate("/doctor/login");
};

  if (!doctor) return null;

  return (
    <div className="dashboard-container">
      {/* Topbar */}
      <header className="topbar">
        <div className="left-top">
          <FaBars
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <h2>🩺 TeleMed Doctor</h2>
        </div>

        <div className="profile-area">
          <FaUserCircle size={24} />
          <span>Dr. {doctor.name}</span>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="body-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <ul>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaHome /> <span>Dashboard</span>
            </li>

            <li onClick={() => navigate("/doctor/video-call")}>
              <FaVideo /> <span>Video Call</span>
            </li>
          </ul>
        </aside>

        {/* Main */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <div className="cards-grid">
              <div className="card pending">
                <FaClock size={24} />
                <h4>Pending</h4>
                <p>{stats.pending}</p>
              </div>

              <div className="card accepted">
                <FaCheckCircle size={24} />
                <h4>Accepted</h4>
                <p>{stats.accepted}</p>
              </div>

              <div className="card rejected">
                <FaTimesCircle size={24} />
                <h4>Rejected</h4>
                <p>{stats.rejected}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
