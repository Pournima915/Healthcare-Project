import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookAppointment.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem("patientAuth"));
  const doctors = JSON.parse(localStorage.getItem("doctors")) || [];

  const [form, setForm] = useState({
    doctorEmail: "",
    date: "",
    time: "",
    reason: "",
  });

  useEffect(() => {
    if (!patient) navigate("/patient/login");
  }, [patient, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (selectedDate < today) {
      alert("❌ Cannot book past appointments");
      return;
    }

    const doctor = doctors.find(d => d.email === form.doctorEmail);
    if (!doctor) {
      alert("Doctor not found");
      return;
    }

    const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

    appointments.push({
      id: Date.now(),
      patientEmail: patient.email,
      patientName: patient.name,
      doctorEmail: doctor.email,
      doctorName: doctor.name,
      date: form.date,
      time: form.time,
      reason: form.reason,
      status: "pending",
      createdAt: new Date().toISOString()

      
    });

    localStorage.setItem("appointments", JSON.stringify(appointments));
    alert("✅ Appointment request sent to doctor");
    navigate("/patient/dashboard");
  };

  return (
    <div className="ba-container fade-in">
      <form className="ba-card" onSubmit={handleSubmit}>
        <h2>📅 Book Appointment</h2>

        <select
          required
          value={form.doctorEmail}
          onChange={(e) => setForm({ ...form, doctorEmail: e.target.value })}
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.email} value={d.email}>
              Dr. {d.name} ({d.specialization})
            </option>
          ))}
        </select>

        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          type="time"
          required
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />

        <textarea
          placeholder="Reason for appointment"
          required
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />

        <button type="submit">Request Appointment</button>
      </form>
    </div>
  );
}
