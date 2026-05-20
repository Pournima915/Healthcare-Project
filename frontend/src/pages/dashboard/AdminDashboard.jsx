import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
} from "react-icons/fa";

import socket from "../../socket";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api/admin";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("doctors");

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // ================= AUTH =================
  useEffect(() => {
    const admin = localStorage.getItem("adminAuth");
    if (!admin) navigate("/admin/login");
  }, [navigate]);

  // ================= FETCH =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, patRes, appRes] = await Promise.all([
        fetch(`${API}/doctors`),
        fetch(`${API}/patients`),
        fetch(`${API}/appointments`),
      ]);

      setDoctors(await docRes.json());
      setPatients(await patRes.json());
      setAppointments(await appRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SOCKET =================
  useEffect(() => {
    socket.on("new-appointment", (data) => {
      setAppointments((prev) => [data, ...prev]);
    });

    return () => socket.off("new-appointment");
  }, []);

  // ================= UPDATE DOCTOR =================
  const updateDoctorStatus = async (id, status) => {
    const res = await fetch(`${API}/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const updated = await res.json();
    setDoctors((prev) =>
      prev.map((d) => (d._id === updated._id ? updated : d))
    );
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  // ================= FILTER APPOINTMENTS =================
  const filteredAppointments = appointments
    .filter((a) =>
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((a) =>
      filterStatus === "All" ? true : a.status === filterStatus
    )
    .sort((a, b) => {
      const A = new Date(`${a.date} ${a.startTime}`);
      const B = new Date(`${b.date} ${b.startTime}`);
      return B - A;
    });

  return (
    <div className="dashboard-container">

      {/* ================= TOPBAR ================= */}
      <header className="topbar">
        <div className="left-top">
          <FaBars onClick={() => setSidebarOpen(!sidebarOpen)} />
          <h2>🩺 TeleMed Admin</h2>
        </div>

        <div className="right-top">
          <FaUserCircle />
          <button onClick={logout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="body-container">

        {/* ================= SIDEBAR ================= */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <ul>
            <li
              className={activeTab === "doctors" ? "active" : ""}
              onClick={() => setActiveTab("doctors")}
            >
              <FaUserMd /> Doctors
            </li>

            <li
              className={activeTab === "patients" ? "active" : ""}
              onClick={() => setActiveTab("patients")}
            >
              <FaUsers /> Patients
            </li>

            <li
              className={activeTab === "appointments" ? "active" : ""}
              onClick={() => setActiveTab("appointments")}
            >
              <FaCalendarCheck /> Appointments
            </li>
          </ul>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="main-content">

          {/* ================= DOCTORS TABLE ================= */}
          {activeTab === "doctors" && (
            <>
              <h2>Doctors</h2>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {doctors.map((d) => (
                    <tr key={d._id}>
                      <td>Dr. {d.name}</td>
                      <td>{d.email}</td>
                      <td>{d.specialization}</td>
                      <td>{d.experience} yrs</td>

                      <td>
                        <span className={`badge ${d.status}`}>
                          {d.status}
                        </span>
                      </td>

                      <td>
                        {d.status === "waiting" && (
                          <button
                            onClick={() =>
                              updateDoctorStatus(d._id, "approved")
                            }
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ================= PATIENTS TABLE ================= */}
          {activeTab === "patients" && (
            <>
              <h2>Patients</h2>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ================= APPOINTMENTS TABLE ================= */}
          {activeTab === "appointments" && (
            <>
              <h2>Appointments</h2>

              <div className="controls">
                <input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option>All</option>
                  <option>pending</option>
                  <option>accepted</option>
                  <option>rescheduled</option>
                </select>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.patientName}</td>
                       <td>
                      {a.doctorName
                        ? `Dr. ${a.doctorName}`
                        : a.doctorEmail?.split("@")[0] || "N/A"}
                    </td>
                    <td>{a.date}</td>
                    <td>
                      {a.startTime && a.endTime
                        ? `${a.startTime} - ${a.endTime}`
                        : "-"}
                    </td>
                      <td>
                        <span className={`badge ${a.status}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

        </main>
      </div>
    </div>
  );
}