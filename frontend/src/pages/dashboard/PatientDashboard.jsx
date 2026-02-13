import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaVideo,
  FaBell,
  FaBars,
  FaHome,
  FaPlusCircle,
} from "react-icons/fa";

import "./PatientDashboard.css";
import PatientAppointments from "../patient/PatientAppointments";
import BookAppointment from "../patient/BookAppointment";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    rescheduled: 0,
  });

  /* Auth Protection */
  useEffect(() => {
    const token = localStorage.getItem("patientToken");
    const storedPatient = localStorage.getItem("patientAuth");

    if (!token || !storedPatient) {
      navigate("/patient/login");
      return;
    }

    setPatient(JSON.parse(storedPatient));
  }, [navigate]);

  /* Stats Calculation */
  useEffect(() => {
    if (!patient) return;

    const appointments =
      JSON.parse(localStorage.getItem("appointments")) || [];

    const myAppointments = appointments.filter(
      (a) => a.patientEmail === patient.email
    );

    const result = { pending: 0, accepted: 0, rejected: 0, rescheduled: 0 };

    myAppointments.forEach((a) => {
      if (result[a.status] !== undefined) result[a.status]++;
    });

    setStats(result);
  }, [patient]);

  /* Notifications */
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => [
        ...prev,
        "Appointment status updated",
      ]);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  if (!patient) return null;

  return (
    <div className="dashboard-container">

      {/* Topbar */}
      <header className="topbar">
        <div className="left-top">
          <FaBars
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <h2>🩺 TeleMed</h2>
        </div>

        <div className="right-top">
          <div className="notification-icon">
            <FaBell size={18} />
            {notifications.length > 0 && (
              <span className="notif-badge">
                {notifications.length}
              </span>
            )}
          </div>

          <div className="profile-area">
            <FaUserCircle size={24} />
            <span>{patient.name}</span>
            <button className="logout-btn" onClick={logout}>
              <FaSignOutAlt />
            </button>
          </div>
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

            <li
              className={activeTab === "appointments" ? "active" : ""}
              onClick={() => setActiveTab("appointments")}
            >
              <FaCalendarCheck /> <span>Appointments</span>
            </li>

            {/* ✅ NEW BOOK APPOINTMENT */}
            <li
              className={activeTab === "book" ? "active" : ""}
              onClick={() => setActiveTab("book")}
            >
              <FaPlusCircle /> <span>Book Appointment</span>
            </li>

            <li onClick={() => navigate("/patient/video-call")}>
              <FaVideo /> <span>Video Call</span>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
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

              <div className="card rescheduled">
                <FaRedo size={24} />
                <h4>Rescheduled</h4>
                <p>{stats.rescheduled}</p>
              </div>

            </div>
          )}

          {activeTab === "appointments" && <PatientAppointments />}
          {activeTab === "book" && <BookAppointment />}

        </main>
      </div>
    </div>
  );
}
