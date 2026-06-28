import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DoctorAvailability() {
  const doctor = JSON.parse(localStorage.getItem("doctorAuth"));

  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const generateSlots = () => {
    if (!date) {
      alert("Please select date");
      return;
    }

    let times = [];
    let start = 9;
    let end = 18;

    for (let h = start; h < end; h += duration / 60) {
      const hour = Math.floor(h);
      const min = (h % 1) * 60;

      times.push({
        time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        status: "available",
      });
    }

    setSlots(times);
  };

  const blockSlot = (index) => {
    const updated = [...slots];

    updated[index].status =
      updated[index].status === "blocked" ? "available" : "blocked";

    setSlots(updated);
  };

  const save = async () => {
    if (!date || slots.length === 0) {
      alert("Generate slots first");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/availability", {
        doctorEmail: doctor.email,
        date,
        slots,
      });

      alert("✅ Availability Saved");

    } catch (err) {
      console.error(err);
      alert("Backend route not found!");
    }
  };

  return (
    <div>
      <h2>Set Unavailability</h2>

      <input
        type="date"
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      &ensp;&ensp;

      <select
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      >
        <option value={30}>30 min</option>
        <option value={60}>1 hour</option>
        <option value={120}>2 hour</option>
      </select>
      &ensp;  &ensp;

      <button onClick={generateSlots}>Generate Slots</button>

      <div style={{ marginTop: "15px" }}>
        {slots.map((s, i) => (
          <button
            key={i}
            style={{
              margin: "5px",
              padding: "8px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              background: s.status === "blocked" ? "#ff4d4d" : "#4CAF50",
              color: "white",
            }}
            onClick={() => blockSlot(i)}
          >
            {s.time}
          </button>
        ))}
      </div>

      <button style={{ marginTop: "15px" }} onClick={save}>
        Save
      </button>
    </div>
  );
}