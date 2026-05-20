import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
 FaClock, FaCheckCircle, FaBell, FaUserCircle, FaBars,
 FaHome, FaCalendarCheck, FaPlusCircle,
 FaComments, FaRobot, FaVideo, FaCalendarPlus, FaSignOutAlt
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./PatientDashboard.css";

import PatientProfile from "../patient/PatientProfile";
import PatientAppointments from "../patient/PatientAppointments";
import BookAppointment from "../patient/BookAppointment";

import ChatBox from "../../components/ChatBox";
import SymptomChecker from "../../components/SymptomChecker";

import { useTranslation } from "react-i18next";

export default function PatientDashboard() {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rescheduled: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const [onlineDoctors, setOnlineDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const notifRef = useRef(null);

  // ================= LOAD DOCTORS =================
  useEffect(() => {
    axios.get("http://localhost:5000/api/doctor/all")
      .then(res => setDoctors(res.data))
      .catch(err => console.log(err));
  }, []);

  // ================= LOAD USER =================
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("patientAuth"));
    if (data) setPatient(data);
  }, []);

  // ================= LOAD NOTIFICATIONS (NEW) =================
  const loadNotifications = async () => {
    if (!patient) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointment/notifications/${patient._id}`
      );

      setTodayAppointments(res.data.today || []);
      setTomorrowAppointments(res.data.tomorrow || []);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOAD STATS =================
  const loadStats = async () => {
    if (!patient) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointment/stats/${patient.email}`
      );
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LANGUAGE =================
  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  // ================= LOGOUT =================
  const logout = () => {
    socket.emit("patient-offline", patient.email);
    localStorage.clear();
    navigate("/patient/login");
  };

  // ================= SOCKET =================
  useEffect(() => {
    if (!patient) return;

    loadStats();
    loadNotifications(); // 🔥 IMPORTANT

    socket.emit("patient-online", patient.email);
    socket.emit("get-online-doctors");

    socket.on("notification", (msg) => {
      setNotifications((prev) => [msg, ...prev]);
      loadStats();
      loadNotifications(); // refresh appointments
    });

    socket.emit("join-room", patient.email);

    socket.on("online-doctors", (docs) => {
      setOnlineDoctors(docs);
    });

    return () => {
      socket.off("notification");
      socket.off("online-doctors");
    };

  }, [patient]);

  // ================= CLOSE DROPDOWN ON CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= CALL =================
  const startCall = async (doctorEmail, type) => {
    const appointmentId = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video"
      });

      window.localStream = stream;

      socket.emit("call-doctor", {
        to: doctorEmail,
        from: patient.email,
        patientName: patient.name,
        appointmentId,
        type
      });

      alert(`📞 ${t("calling")}`);

      socket.once("call-accepted", (data) => {
        if (type === "voice") {
          navigate(`/voice-call/${patient.email}-${doctorEmail}-${data.appointmentId}`);
        } else {
          navigate(`/patient/video-call/${data.appointmentId}`);
        }
      });

      socket.once("call-rejected", () => {
        alert(`❌ ${t("rejected")}`);
      });

    } catch (err) {
      alert("Microphone permission denied ❌");
    }
  };

  if (!patient) return null;

  return (
    <div className="dashboard-container">

      {/* TOPBAR */}
      <header className="topbar">
        <div className="left-top">
          <FaBars onClick={() => setSidebarOpen(!sidebarOpen)} />
          <h2>🩺 TeleMed Patient</h2>
        </div>

        <div className="right-top" ref={notifRef}>

          {/* 🔔 NOTIFICATION ICON */}
          <div
            className="notification-icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />

            {(notifications.length + todayAppointments.length + tomorrowAppointments.length) > 0 && (
              <span className="notif-badge">
                {notifications.length + todayAppointments.length + tomorrowAppointments.length}
              </span>
            )}
          </div>

          {/* 🔽 DROPDOWN */}
{showNotifications && (
  <div className="notification-dropdown">

    {/* REALTIME NOTIFICATIONS */}
    {notifications.length > 0 && (
      <>
        <h4>🔔 Recent Notifications</h4>

        {notifications.map((n, i) => (
          <div key={i} className="notif-item">
            {n}
          </div>
        ))}
      </>
    )}

    {/* TODAY APPOINTMENTS */}
    <h4>📅 Today</h4>

    {todayAppointments.length === 0 ? (
      <p className="empty-notif">No appointments today</p>
    ) : (
      todayAppointments.map((a, i) => (
        <div key={i} className="notif-item">
          ⏰ {a.startTime} - Dr. {a.doctorName}
        </div>
      ))
    )}

    {/* TOMORROW APPOINTMENTS */}
    <h4>📅 Tomorrow</h4>

    {tomorrowAppointments.length === 0 ? (
      <p className="empty-notif">No appointments tomorrow</p>
    ) : (
      tomorrowAppointments.map((a, i) => (
        <div key={i} className="notif-item">
          ⏰ {a.startTime} - Dr. {a.doctorName}
        </div>
      ))
    )}

  </div>
)}
          <FaUserCircle size={22} />
          <span>{patient.name}</span>

          <button onClick={logout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="body-container">

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <ul>
            <li onClick={() => setActiveTab("dashboard")}>
              <FaHome /> <span>{t("dashboard")}</span>
            </li>

            <li onClick={() => setActiveTab("appointments")}>
              <FaCalendarCheck /> <span>{t("appointments")}</span>
            </li>

            <li onClick={() => setActiveTab("book")}>
              <FaPlusCircle /> <span>{t("book")}</span>
            </li>

            <li onClick={() => setActiveTab("chat")}>
              <FaComments /> <span>{t("chat")}</span>
            </li>

            <li onClick={() => setActiveTab("symptom")}>
              <FaRobot /> <span>{t("symptom")}</span>
            </li>
          </ul>
        </aside>

        {/* MAIN */}
        <main className="main-content">

          {activeTab === "dashboard" && (
            <>
              <select
                onChange={(e) => changeLang(e.target.value)}
                value={i18n.language}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select><br /><br />

              <div className="cards-grid">
                <div className="card pending"><FaClock /> <h4>{t("pending")}</h4> <p>{stats.pending}</p></div>
                <div className="card accepted"><FaCheckCircle /> <h4>{t("accepted")}</h4> <p>{stats.accepted}</p></div>
                <div className="card rescheduled"><FaCalendarPlus /> <h4>{t("rescheduled")}</h4> <p>{stats.rescheduled}</p></div>
              </div>

              <h3>🟢 {t("onlineDoctors")}</h3>

              {onlineDoctors.length === 0 ? (
                <p>{t("noDoctors")}</p>
              ) : (
                onlineDoctors.map((doc, i) => (
                  <div key={i} className="doctor-card">
                    <span>Dr. {doc.name}</span>

                    <button onClick={() => startCall(doc.email, "video")}>
                      🎥 {t("video")}
                    </button>

                    <button onClick={() => startCall(doc.email, "voice")}>
                      📞 {t("voice")}
                    </button>
                  </div>
                ))
              )}
              {/* 🔔 APPOINTMENT NOTIFICATIONS */}
<h3>📅 Upcoming Appointments</h3>

{todayAppointments.length === 0 && tomorrowAppointments.length === 0 ? (
  <p>No upcoming appointments</p>
) : (
  <>
    <h4>Today</h4>
    {todayAppointments.map((a, i) => (
      <div key={i} className="appointment-card">
        ⏰ {a.startTime} - Dr. {a.doctorName}
      </div>
    ))}

    <h4>Tomorrow</h4>
    {tomorrowAppointments.map((a, i) => (
      <div key={i} className="appointment-card">
        ⏰ {a.startTime} - Dr. {a.doctorName}
      </div>
    ))}
  </>
)}
            </>
          )}

          {activeTab === "appointments" && <PatientAppointments />}
          {activeTab === "book" && <BookAppointment />}
          {activeTab === "chat" && <ChatBox user={patient} usersList={doctors} />}
          {activeTab === "symptom" && <SymptomChecker />}
          {activeTab === "profile" && <PatientProfile patient={patient} />}

        </main>
      </div>
    </div>
  );
}