import { useEffect, useState } from "react";
import "./PatientAppointments.css";

export default function PatientAppointments() {
  const patient = JSON.parse(localStorage.getItem("patient"));

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const allAppointments =
      JSON.parse(localStorage.getItem("appointments")) || [];

   const myAppointments = allAppointments.filter(
  (a) =>
    a.patientEmail === patient.email &&
    a.status === "accepted"
);

    setAppointments(myAppointments);
  }, [patient.email]);

  return (
    <div className="pa-container">
      <h2>📅 My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments booked yet.</p>
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
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.doctorName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <span className={`status ${a.status}`}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {a.status === "pending" && "Waiting for doctor approval"}
                  {a.status === "accepted" && "✅ Appointment confirmed"}
                  {a.status === "rejected" && "❌ Doctor rejected request"}
                  {a.status === "rescheduled" &&
                    "🔁 Doctor requested reschedule"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
