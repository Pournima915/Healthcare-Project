import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("doctors");
  const [doctors, setDoctors] = useState([]);

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const admin = localStorage.getItem("adminAuth");
    if (!admin) navigate("/admin/login");
  }, [navigate]);

  /* ✅ FETCH DOCTORS FROM BACKEND */
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error(err));
  }, []);

  /* ✅ UPDATE DOCTOR STATUS */
  const updateDoctorStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/doctors/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const updatedDoctor = await response.json();

      setDoctors((prev) =>
        prev.map((doc) =>
          doc._id === updatedDoctor._id ? updatedDoctor : doc
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>TeleMed Admin</h2>
        <ul>
          <li onClick={() => setActiveTab("doctors")}>👨‍⚕️ Doctors</li>
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

      {/* MAIN CONTENT */}
      <main className="admin-main">
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
                  <th>Action</th>
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
                          className="approve"
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
