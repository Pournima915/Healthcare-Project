import React, { useEffect, useState } from "react";
import "./PatientAppointments.css";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");

    if (!storedPatient) {
      return;
    }

    const patient = JSON.parse(storedPatient);

    const allAppointments =
      JSON.parse(localStorage.getItem("appointments")) || [];

    const myAppointments = allAppointments.filter(
      (a) =>
        a.patientEmail === patient.email &&
        a.status === "accepted"
    );

    setAppointments(myAppointments);
  }, []); // 🔥 IMPORTANT: EMPTY DEPENDENCY ARRAY

  return (
    <div className="pa-container">
      <h2>📅 My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No accepted appointments yet.</p>
      ) : (
        <table className="pa-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a, index) => (
              <tr key={index}>
                <td>{a.doctorName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <span className={`status ${a.status}`}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {a.status === "accepted"
                    ? "✅ Appointment confirmed"
                    : "Waiting"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
