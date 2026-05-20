import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaUserCircle,
  FaSignOutAlt,
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaBars,
  FaHome,
  FaComments,
  FaCalendarPlus,
  FaBell,
} from "react-icons/fa";

import "./DoctorDashboard.css";

import DoctorProfile from "../doctor/DoctorProfile";
import DoctorAppointments from "../doctor/DoctorAppointments";
import DoctorAvailability from "../doctor/DoctorAvailability";

import ChatBox from "../../components/ChatBox";
import TodayNotifications from "../../components/TodayNotifications";

import socket from "../../socket";

export default function DoctorDashboard() {

  const navigate = useNavigate();

  const notifRef = useRef(null);

  const [doctor, setDoctor] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rescheduled: 0,
  });

  // realtime socket notifications
  const [notifications, setNotifications] = useState([]);

  // appointment notifications
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const [patients, setPatients] = useState([]);

  const [incomingCall, setIncomingCall] = useState(null);

  // ================= LOAD PATIENTS =================
  useEffect(() => {

    if (!doctor?.email) return;

    axios
      .get(`http://localhost:5000/api/appointment/doctor/${doctor.email}`)
      .then((res) => {

        const unique = [];

        res.data.forEach((a) => {

          if (!unique.find((p) => p.email === a.patientEmail)) {

            unique.push({
              email: a.patientEmail,
              name: a.patientName,
            });

          }

        });

        setPatients(unique);

      });

  }, [doctor]);

  // ================= AUTH =================
  useEffect(() => {

    const stored = localStorage.getItem("doctorAuth");

    if (!stored) return navigate("/doctor/login");

    const d = JSON.parse(stored);

    if (d.status !== "approved") {

      alert("Waiting for admin approval");

      localStorage.clear();

      return navigate("/doctor/login");
    }

    setDoctor(d);

    socket.emit("join-room", d.email);

    socket.emit("doctor-online", d.email);

    return () => {
      socket.emit("doctor-offline", d.email);
    };

  }, [navigate]);

  // ================= LOAD STATS =================
  const loadStats = async (email) => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/appointment/doctor/${email}`
      );

      const result = {
        pending: 0,
        accepted: 0,
        rescheduled: 0,
      };

      res.data.forEach((a) => {

        if (result[a.status] !== undefined) {
          result[a.status]++;
        }

      });

      setStats(result);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOAD APPOINTMENT NOTIFICATIONS =================
  const loadAppointmentNotifications = async () => {

    if (!doctor) return;

    try {

      // IMPORTANT:
      // using doctor.email instead of doctor._id
      // because backend usually searches by email

      const res = await axios.get(
        `http://localhost:5000/api/appointment/doctor/${doctor.email}`
      );

      const today = [];
      const tomorrow = [];

      const todayDate = new Date();

      const tomorrowDate = new Date();

      tomorrowDate.setDate(todayDate.getDate() + 1);

      const formatDate = (date) => {
        return new Date(date).toISOString().split("T")[0];
      };

      const todayStr = formatDate(todayDate);

      const tomorrowStr = formatDate(tomorrowDate);

      res.data.forEach((a) => {

        const appDate = formatDate(a.date);

        if (appDate === todayStr) {
          today.push(a);
        }

        else if (appDate === tomorrowStr) {
          tomorrow.push(a);
        }

      });

      setTodayAppointments(today);

      setTomorrowAppointments(tomorrow);

    } catch (err) {

      console.log(err);

    }
  };

  // ================= SOCKET =================
  useEffect(() => {

    if (!doctor) return;

    loadStats(doctor.email);

    loadAppointmentNotifications();

    socket.on("notification", (msg) => {

      setNotifications((prev) => [msg, ...prev]);

      loadStats(doctor.email);

      // refresh appointment notifications
      loadAppointmentNotifications();

    });

    socket.on("incoming-call", (data) => {

      console.log("CALL RECEIVED:", data);

      setIncomingCall(data);

    });

    return () => {

      socket.off("notification");

      socket.off("incoming-call");

    };

  }, [doctor]);

  // ================= CLOSE DROPDOWN =================
  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  // ================= ACCEPT CALL =================
  const acceptCall = () => {

    socket.emit("call-accepted", {
      to: incomingCall.patientEmail,
      appointmentId: incomingCall.appointmentId,
    });

    if (incomingCall.type === "voice") {

      navigate(
        `/voice-call/${incomingCall.patientEmail}-${doctor.email}-${incomingCall.appointmentId}`
      );

    } else {

      navigate(`/doctor/video-call/${incomingCall.appointmentId}`);

    }
  };

  // ================= REJECT CALL =================
  const rejectCall = () => {

    socket.emit("call-rejected", {
      to: incomingCall.patientEmail,
    });

    setIncomingCall(null);

  };

  // ================= LOGOUT =================
  const logout = () => {

    socket.emit("doctor-offline", doctor.email);

    localStorage.clear();

    navigate("/doctor/login");

  };

  if (!doctor) return null;

  return (
    <div className="dashboard-container">

      {/* TOPBAR */}
      <header className="topbar">

        <FaBars
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <h2>🩺 TeleMed Doctor</h2>

        <div className="profile-area" ref={notifRef}>

          {/* 🔔 BELL ICON */}
          <div
            className="notification-icon"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >

            <FaBell size={22} />

            {(notifications.length +
              todayAppointments.length +
              tomorrowAppointments.length) > 0 && (
              <span className="notif-badge">

                {notifications.length +
                  todayAppointments.length +
                  tomorrowAppointments.length}

              </span>
            )}

          </div>

          {/* 🔽 NOTIFICATION DROPDOWN */}
          {showNotifications && (

            <div className="notification-dropdown">

              {/* REALTIME SOCKET NOTIFICATIONS */}
              {notifications.length > 0 && (
                <>
                  <h4>🔔 Recent Notifications</h4>

                  {notifications.map((n, i) => (
                    <div key={i} className="notif-item">

                      {typeof n === "object"
                        ? n.message
                        : n}

                    </div>
                  ))}
                </>
              )}

              {/* TODAY */}
              <h4>📅 Today</h4>

              {todayAppointments.length === 0 ? (

                <p className="empty-notif">
                  No appointments today
                </p>

              ) : (

                todayAppointments.map((a, i) => (

                  <div
                    key={i}
                    className="notif-item"
                  >

                    ⏰ {a.startTime} - {a.patientName}

                  </div>

                ))

              )}

              {/* TOMORROW */}
              <h4>📅 Tomorrow</h4>

              {tomorrowAppointments.length === 0 ? (

                <p className="empty-notif">
                  No appointments tomorrow
                </p>

              ) : (

                tomorrowAppointments.map((a, i) => (

                  <div
                    key={i}
                    className="notif-item"
                  >

                    ⏰ {a.startTime} - {a.patientName}

                  </div>

                ))

              )}

            </div>

          )}

          <FaUserCircle size={22} />

          <span>Dr. {doctor.name}</span>

          <button onClick={logout}>
            <FaSignOutAlt />
          </button>

        </div>
      </header>

      <div className="body-container">

        {/* SIDEBAR */}
        <aside
          className={`sidebar ${
            sidebarOpen ? "open" : "closed"
          }`}
        >

          <ul>

            <li
              onClick={() =>
                setActiveTab("dashboard")
              }
            >
              <FaHome /> Dashboard
            </li>

            <li
              onClick={() =>
                setActiveTab("appointments")
              }
            >
              <FaCalendarCheck /> Appointments
            </li>

            <li
              onClick={() =>
                setActiveTab("availability")
              }
            >
              <FaCalendarPlus /> Unavailability
            </li>

            <li
              onClick={() =>
                setActiveTab("chat")
              }
            >
              <FaComments /> Chat
            </li>

          </ul>

        </aside>

        {/* MAIN */}
        <main className="main-content">

          {activeTab === "dashboard" && (
            <>

              {/* STATS CARDS */}
              <div className="cards-grid">

                <div className="card pending">
                  <FaClock />
                  <h4>pending</h4>
                  <p>{stats.pending}</p>
                </div>

                <div className="card accepted">
                  <FaCheckCircle />
                  <h4>accepted</h4>
                  <p>{stats.accepted}</p>
                </div>

                <div className="card rescheduled">
                  <FaCalendarPlus />
                  <h4>rescheduled</h4>
                  <p>{stats.rescheduled}</p>
                </div>

              </div>

              {/* 📞 INCOMING CALL */}
              {incomingCall && (
                <div className="call-popup">

                  <h3>
                    📞 Incoming {incomingCall.type} Call
                  </h3>

                  <p>{incomingCall.patientName}</p>

                  <button
                    className="accept"
                    onClick={acceptCall}
                  >
                    Accept
                  </button>

                  <button
                    className="reject"
                    onClick={rejectCall}
                  >
                    Reject
                  </button>

                </div>
              )}

              {/* DASHBOARD APPOINTMENT NOTIFICATIONS */}
              <TodayNotifications email={doctor.email} />

            </>
          )}

          {activeTab === "appointments" && (
            <DoctorAppointments />
          )}

          {activeTab === "availability" && (
            <DoctorAvailability />
          )}

          {activeTab === "chat" && (
            <ChatBox
              user={doctor}
              usersList={patients}
            />
          )}

          {activeTab === "profile" && (
            <DoctorProfile />
          )}

        </main>
      </div>
    </div>
  );
}