import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../socket";
import "./DoctorProfile.css";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);

  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // ================= LOAD DOCTOR =================
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("doctorAuth"));
    if (data) {
      setDoctor(data);
      loadAppointments(data.email);
      socket.emit("join-room", data.email);
    }
  }, []);

  // ================= REALTIME =================
  useEffect(() => {
    socket.on("notification", () => {
      if (doctor) loadAppointments(doctor.email);
    });

    return () => socket.off("notification");
  }, [doctor]);

  // ================= LOAD =================
  const loadAppointments = async (email) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointment/doctor/${email.trim().toLowerCase()}`
      );
      setAppointments(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ACTIONS =================
  const approve = async (id) => {
    await axios.put(
      `http://localhost:5000/api/appointment/approve/${id}`
    );
    loadAppointments(doctor.email);
  };

  const reschedule = async (id) => {
    if (!newDate || !newTime) {
      return alert("Select date & time");
    }

    try {
      await axios.put(
        `http://localhost:5000/api/appointment/reschedule/${id}`,
        {
          date: newDate,
          startTime: newTime,
        }
      );

      setRescheduleId(null);
      setNewDate("");
      setNewTime("");

      loadAppointments(doctor.email);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="doctor-container">
      <h2>📅 Doctor Appointments</h2>

      <div className="table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((a) => {
                const status = (a.status || "pending").toLowerCase();

                return (
                  <tr key={a._id}>
                    <td>{a.patientName || "N/A"}</td>
                    <td>{a.date}</td>
                    <td>
                      {a.startTime} - {a.endTime}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span className={`status ${status}`}>
                        {status === "pending" && "Waiting"}
                        {status === "accepted" && "Accepted"}
                        {status === "rescheduled" && "Rescheduled"}
                      </span>
                    </td>
                    {/* ACTIONS */}
                    <td className="actions">
                      {status === "pending" && (
                        <button
                          className="btn accept"
                          onClick={() => approve(a._id)}
                        >
                          Accept
                        </button>
                      )}

                      <button
                        className="btn reschedule"
                        onClick={() => setRescheduleId(a._id)}
                      >
                        Reschedule
                      </button>

                      {rescheduleId === a._id && (
                        <div className="reschedule-box">
                          <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                          />
                          <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                          />
                          <button
                            className="btn confirm"
                            onClick={() => reschedule(a._id)}
                          >
                            Confirm
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}