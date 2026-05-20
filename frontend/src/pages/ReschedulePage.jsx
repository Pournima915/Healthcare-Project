import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ReschedulePage() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [date, setDate] = useState("");
  const [booked, setBooked] = useState([]);
  const [selected, setSelected] = useState("");

  const slots = [
    "09:00","10:00","11:00","12:00",
    "14:00","15:00","16:00","17:00","18:00"
  ];

  useEffect(() => {
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/appointment/id/${id}`
    );
    setAppointment(res.data);
  };

  const fetchSlots = async (d) => {
    const res = await axios.get(
      `http://localhost:5000/api/appointment/available/${appointment.doctorEmail}/${d}`
    );

    setBooked(res.data.booked || []);
  };

  const isDisabled = (slot) => {
    const now = new Date();
    const slotTime = new Date(`${date}T${slot}`);

    return slotTime < now || booked.includes(slot);
  };

  const handleSubmit = async () => {
    if (!selected) return alert("Select slot");

    await axios.put(
      `http://localhost:5000/api/appointment/reschedule/${id}`,
      {
        date,
        startTime: selected,
      }
    );

    alert("✅ Rescheduled");
  };

  return (
    <div>
      <h2>Reschedule Appointment</h2>

      <input
        type="date"
        onChange={(e) => {
          setDate(e.target.value);
          fetchSlots(e.target.value);
        }}
      />

      <div>
        {slots.map((s) => (
          <button
            key={s}
            disabled={isDisabled(s)}
            onClick={() => setSelected(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <button onClick={handleSubmit}>Confirm</button>
    </div>
  );
}