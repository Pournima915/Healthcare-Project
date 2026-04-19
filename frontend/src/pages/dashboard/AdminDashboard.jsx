import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api/admin";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔐 Admin Auth Check */
  useEffect(() => {
    const admin = localStorage.getItem("adminAuth");
    if (!admin) navigate("/admin/login");
  }, [navigate]);

  /* 🚀 Fetch Data From Backend */
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [docRes, patRes, appRes] = await Promise.all([
        fetch(`${API}/doctors`),
        fetch(`${API}/patients`),
        fetch(`${API}/appointments`),
      ]);

      const docs = await docRes.json();
      const pats = await patRes.json();
      const apps = await appRes.json();

      setDoctors(docs);
      setPatients(pats);
      setAppointments(apps);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ✅ Update Doctor Status */
  const updateDoctorStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const updated = await res.json();
      setDoctors((prev) =>
        prev.map((d) => (d._id === updated._id ? updated : d))
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ✅ Update Patient Status */
  const updatePatientStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const updated = await res.json();
      setPatients((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ❌ Delete Doctor */
  const deleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor permanently?")) return;

    try {
      await fetch(`${API}/doctors/${id}`, { method: "DELETE" });
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="logo">TeleMed Admin</h2>
        <ul>
          <li
            className={activeTab === "doctors" ? "active" : ""}
            onClick={() => setActiveTab("doctors")}
          >
            👨‍⚕️ Doctors
          </li>
          <li
            className={activeTab === "patients" ? "active" : ""}
            onClick={() => setActiveTab("patients")}
          >
            🧑 Patients
          </li>
          <li
            className={activeTab === "appointments" ? "active" : ""}
            onClick={() => setActiveTab("appointments")}
          >
            📅 Appointments
          </li>
          <li
            className="logout"
            onClick={() => {
              localStorage.removeItem("adminAuth");
              navigate("/admin/login");
            }}
          >
            🚪 Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <>
            <h2>Doctor Verification</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d._id}>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.specialization}</td>
                    <td>{d.experience} yrs</td>
                    <td>
                      <span className={`badge ${d.status}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      {d.status !== "approved" && (
                        <button
                          onClick={() =>
                            updateDoctorStatus(d._id, "approved")
                          }
                        >
                          Approve
                        </button>
                      )}
                      {d.status !== "rejected" && (
                        <button
                          className="reject"
                          onClick={() =>
                            updateDoctorStatus(d._id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="delete"
                        onClick={() => deleteDoctor(d._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <>
            <h2>Patient Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.gender}</td>
                    <td>
                      <span className={`badge ${p.status || "active"}`}>
                        {p.status || "active"}
                      </span>
                    </td>
                    <td>
                      {p.status !== "blocked" ? (
                        <button
                          className="reject"
                          onClick={() =>
                            updatePatientStatus(p._id, "blocked")
                          }
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            updatePatientStatus(p._id, "active")
                          }
                        >
                          Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <>
            <h2>All Appointments</h2>
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td>{a.date}</td>
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
  );
}
