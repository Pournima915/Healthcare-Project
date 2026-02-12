import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const updatePatientStatus = (email, status) => {
  const updated = patients.map((p) =>
    p.email === email ? { ...p, status } : p
  );
  setPatients(updated);
  localStorage.setItem("patients", JSON.stringify(updated));
};
const deleteDoctor = (email) => {
  if (!window.confirm("Delete this rejected doctor permanently?")) return;

  const updated = doctors.filter((d) => d.email !== email);
  setDoctors(updated);
  localStorage.setItem("doctors", JSON.stringify(updated));
};

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const admin = localStorage.getItem("adminAuth");
    if (!admin) navigate("/admin/login");
  }, [navigate]);

  /* LOAD DATA */
  useEffect(() => {
    setDoctors(JSON.parse(localStorage.getItem("doctors")) || []);
    setPatients(JSON.parse(localStorage.getItem("patients")) || []);
    setAppointments(JSON.parse(localStorage.getItem("appointments")) || []);
  }, []);

  /* DOCTOR STATUS UPDATE */
  const updateDoctorStatus = (email, status) => {
    const updated = doctors.map((d) =>
      d.email === email ? { ...d, status } : d
    );
    setDoctors(updated);
    localStorage.setItem("doctors", JSON.stringify(updated));
  };

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>TeleMed Admin</h2>
        <ul>
          <li onClick={() => setActiveTab("doctors")}>👨‍⚕️ Doctors</li>
          <li onClick={() => setActiveTab("patients")}>🧑‍🤝‍🧑 Patients</li>
          <li onClick={() => setActiveTab("appointments")}>📅 Appointments</li>
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

      {/* MAIN */}
      <main className="admin-main">
        {/* DOCTORS */}
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
                  <th>Certificate</th>
                  <th>Status</th>
                  <th>Action</th>

                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.email}>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.specialization}</td>
                    <td>{d.experience} yrs</td>
                    <td>
                    {d.certificateFileName ? (
                      <>
                        <button
                          className="view-btn"
                          onClick={() =>
                            alert(
                              `Verification Certificate:\n\n${d.certificateFileName}\n\n(Admin can download/view in real backend)`
                            )
                          }
                        >
                          👁 View
                        </button>

                        <button
                          className="download-btn"
                          onClick={() =>
                            alert(`Downloading ${d.certificateFileName}...`)
                          }
                        >
                          ⬇ Download
                        </button>
                      </>
                    ) : (
                      "Not Uploaded"
                    )}
                  </td>

                   <td>
  {d.status !== "approved" && (
    <button
      className="approve"
      onClick={() => updateDoctorStatus(d.email, "approved")}
    >
      Approve
    </button>
  )}

  {d.status !== "rejected" && (
    <button
      className="reject"
      onClick={() => updateDoctorStatus(d.email, "rejected")}
    >
      Reject
    </button>
  )}

  {d.status === "rejected" && (
    <button
      className="delete"
      onClick={() => deleteDoctor(d.email)}
    >
      🗑 Delete
    </button>
  )}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* PATIENTS */}
        {activeTab === "patients" && (
          <>
            <h2>Registered Patients</h2>
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
                  <tr key={p.email}>
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
                        onClick={() => updatePatientStatus(p.email, "blocked")}
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        onClick={() => updatePatientStatus(p.email, "active")}
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

        {/* APPOINTMENTS */}
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
                  <tr key={a.id}>
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
