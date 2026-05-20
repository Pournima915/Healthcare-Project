import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TodayNotifications({ email }) {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState([]);

  useEffect(() => {
    if (email) fetchAppointments();
  }, [email]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointment/today/${email}`
      );

      const data = res.data || [];

      const today = new Date().toISOString().slice(0, 10);

      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().slice(0, 10);

      setTodayAppointments(data.filter(a => a.date === today));
      setTomorrowAppointments(data.filter(a => a.date === tomorrow));

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="today-box">
      <h3>📅 Today</h3>
      {todayAppointments.length === 0 ? (
        <p>No appointments today</p>
      ) : (
        todayAppointments.map((a) => (
          <div key={a._id} className="notif-card">
            {a.patientName || "Patient"} - {a.startTime}
          </div>
        ))
      )}

      <h3>📅 Tomorrow</h3>
      {tomorrowAppointments.length === 0 ? (
        <p>No appointments tomorrow</p>
      ) : (
        tomorrowAppointments.map((a) => (
          <div key={a._id} className="notif-card">
            {a.patientName || "Patient"} - {a.startTime}
          </div>
        ))
      )}
    </div>
  );
}