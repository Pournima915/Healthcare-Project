import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";
import PatientAppointments from "../patient/PatientAppointments";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    rescheduled: 0,
  });

  /* 🔐 JWT SECURE PROTECTION */
  useEffect(() => {
    const token = localStorage.getItem("patientToken");

if (!token) {
  navigate("/patient/login");
}
   const storedPatient = localStorage.getItem("patientAuth");

    if (!token || !storedPatient) {
      navigate("/patient/login");
      return;
    }

    setPatient(JSON.parse(storedPatient));
  }, [navigate]);

  /* 📊 Animated Counter */
  useEffect(() => {
    if (!patient) return;

    const appointments =
      JSON.parse(localStorage.getItem("appointments")) || [];

    const myAppointments = appointments.filter(
      (a) => a.patientEmail === patient.email
    );

    const finalStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      rescheduled: 0,
    };

    myAppointments.forEach((a) => {
      if (finalStats[a.status] !== undefined) {
        finalStats[a.status]++;
      }
    });

    // fast animation
    let start = 0;
    const interval = setInterval(() => {
      start++;
      setStats({
        pending: Math.min(start, finalStats.pending),
        accepted: Math.min(start, finalStats.accepted),
        rejected: Math.min(start, finalStats.rejected),
        rescheduled: Math.min(start, finalStats.rescheduled),
      });

      if (start > 20) clearInterval(interval);
    }, 40);

  }, [patient]);

  /* 🔔 Real-time Notifications (Simulated) */
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => [
        ...prev,
        "📢 New health tip available!"
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("patientAuth");
    localStorage.removeItem("patientToken");
    navigate("/patient/login");
  };

  if (!patient) return null;

  return (
    <div className={`pd-dashboard ${darkMode ? "dark" : ""}`}>

      {/* 🔹 TOP NAVBAR */}
      <header className="pd-topbar">
        <h2>🩺 TeleMed</h2>

        <div className="pd-right">

          {/* Dark Mode */}
          <button
            className="toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Notifications */}
          <div className="notification-box">
            🔔 {notifications.length}
          </div>

          {/* Profile Dropdown */}
          <div
            className="profile-area"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            👤 {patient.name}

            {showDropdown && (
              <div className="dropdown">
                <p onClick={logout}>
                  <img
                    src="/mnt/data/84cb5613-0760-45c3-a8c5-cac7640b52d3.png"
                    alt="logout"
                    className="icon"
                  />
                  Logout
                </p>
              </div>
            )}
          </div>

        </div>
      </header>

      <div className="pd-body">

        {/* Sidebar */}
        <aside className="pd-sidebar">
          <ul>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              🏠 Dashboard
            </li>

            <li
              className={activeTab === "appointments" ? "active" : ""}
              onClick={() => setActiveTab("appointments")}
            >
              📅 Appointments
            </li>

            <li
              onClick={() => navigate("/patient/video-call")}
            >
              <img
                src="/mnt/data/79a059f1-43e4-4934-9a24-c249a99874f0.png"
                alt="video"
                className="icon"
              />
              Video Consultation
            </li>
          </ul>
        </aside>

        {/* Main */}
        <main className="pd-main">

          {activeTab === "dashboard" && (
            <div className="cards">

              <div className="card">
                <h3>Pending</h3>
                <p>{stats.pending}</p>
              </div>

              <div className="card">
                <h3>Accepted</h3>
                <p>{stats.accepted}</p>
              </div>

              <div className="card">
                <h3>Rejected</h3>
                <p>{stats.rejected}</p>
              </div>

              <div className="card">
                <h3>Rescheduled</h3>
                <p>{stats.rescheduled}</p>
              </div>

            </div>
          )}

          {activeTab === "appointments" && <PatientAppointments />}

        </main>

      </div>
    </div>
  );
}
