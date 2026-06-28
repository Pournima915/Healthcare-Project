import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../socket";
import { useNavigate } from "react-router-dom";
import "./BookAppointment.css";
import { getUserFromStorage } from "../../utils/auth";
import { useTranslation } from "react-i18next";

export default function BookAppointment() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialist, setSpecialist] = useState("All");
  const [location, setLocation] = useState("");

  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reason, setReason] = useState("");

  const [blockedSlots, setBlockedSlots] = useState([]);

  const slots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
  ];

  const specialists = [
    "All",
    "Dentist",
    "Cardiologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "Gynecologist",
    "Psychiatrist",
    "General Physician"
  ];

  useEffect(() => {

    const user = getUserFromStorage("patientAuth");

    if (!user?._id || !user?.email) {

      alert("Session expired. Please login again.");

      localStorage.clear();

      navigate("/patient/login");

      return;
    }

    setPatient(user);

    socket.emit("patient-online", user.email);

  }, [navigate]);

  useEffect(() => {

    axios.get("http://localhost:5000/api/doctor/all")
      .then(res => setDoctors(res.data || []))
      .catch(err => console.log(err));

  }, []);

  useEffect(() => {

    if (!selectedDoctor || !date) return;

    axios.get(
      `http://localhost:5000/api/appointment/available/${selectedDoctor.email}/${date}`
    )
      .then(res => {

        setBookedSlots(res.data.booked || []);

        setBlockedSlots(res.data.blocked || []);

      })
      .catch(err => console.log(err));

  }, [selectedDoctor, date]);

  const isPastDate = () => {

    if (!date) return false;

    const today = new Date();

    const selected = new Date(date);

    today.setHours(0, 0, 0, 0);

    return selected < today;
  };

  const isPastTime = (slot) => {

    if (!date) return false;

    const now = new Date();

    const selectedDate = new Date(date);

    if (selectedDate.toDateString() !== now.toDateString()) return false;

    const [h, m] = slot.split(":");

    const slotTime = new Date();

    slotTime.setHours(h, m, 0);

    return slotTime < now;
  };

  const handleBooking = async () => {

    if (!selectedDoctor) return alert("Select doctor");

    if (!date) return alert("Select date");

    if (!selectedSlot) return alert("Select time slot");

    if (isPastDate()) {

      return alert("Cannot book past date");
    }

    if (isPastTime(selectedSlot)) {

      return alert("Cannot book past time");
    }

    if (bookedSlots.includes(selectedSlot)) {

      return alert("Slot already booked/rescheduled");
    }

    const [hour, min] = selectedSlot.split(":");

    const startTime = selectedSlot;

    const endTime =
      `${String(parseInt(hour) + 1).padStart(2, "0")}:${min}`;

    try {

      await axios.post(
        "http://localhost:5000/api/appointment",
        {
          patientId: patient._id,
          doctorId: selectedDoctor._id,
          patientEmail: patient.email,
          patientName: patient.name,
          doctorEmail: selectedDoctor.email,
          doctorName: selectedDoctor.name,
          date,
          startTime,
          endTime,
          reason,
        }
      );

      socket.emit("notify", {
        email: selectedDoctor.email,
        message: `New Appointment from ${patient.name}`,
      });

      alert("✅ Appointment Booked Successfully");

      setSelectedDoctor(null);
      setDate("");
      setSelectedSlot("");
      setReason("");

    } catch (err) {

      alert(err.response?.data?.message || "Booking failed");
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];

  const filteredDoctors = doctors

    .filter(d =>
      specialist === "All" ||
      d.specialization?.toLowerCase() === specialist.toLowerCase()
    )

    .filter(d =>
      !location ||
      `${d.area} ${d.district} ${d.state}`
        .toLowerCase()
        .includes(location.toLowerCase())
    );

  const getImage = (doc) => {

    return doc.profileImage
      ? `http://localhost:5000/${doc.profileImage}`
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  };

  return (

    <div className="premium-container">

      <h2>{t("Find Doctors")}</h2>

      <input
        type="text"
        placeholder={t("Search by location")}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="location-search"
      />

      <div className="specialist-grid">

        {specialists.map(spec => (

          <div
            key={spec}
            className={`specialist-card ${specialist === spec ? "active" : ""}`}

            onClick={() => {

              setSpecialist(spec);

              setSelectedDoctor(null);

              setDate("");

              setSelectedSlot("");

            }}
          >
            {spec}
          </div>
        ))}

      </div>

      <div className="doctor-grid">

        {filteredDoctors.map(doc => (

          <div key={doc._id}>

            <div
              className={`doctor-card ${selectedDoctor?._id === doc._id ? "active" : ""}`}

              onClick={() => {

                setSelectedDoctor(doc);

                setDate("");

                setSelectedSlot("");

                setReason("");
              }}
            >

              <div className="doctor-top">

                <img src={getImage(doc)} alt="doctor" />

                <div>

                  <h3>Dr. {doc.name}</h3>

                  <p>{doc.specialization}</p>

                </div>
              </div>

              <div className="doctor-info">

                <p>💰 ₹{doc.fee || 200}</p>

                <p>
                  📍 {doc.area}, {doc.district}, {doc.state}
                </p>

              </div>

              {doc.online && (
                <span className="online-badge">
                  🟢 Online
                </span>
              )}

            </div>

            {selectedDoctor?._id === doc._id && (

              <div
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  background: "#fff"
                }}
              >

                <h4>Select Date</h4>

                <input
                  type="date"
                  min={todayDate}
                  value={date}

                  onChange={(e) => {

                    setDate(e.target.value);

                    setSelectedSlot("");
                  }}
                />

                {date && !isPastDate() && (
                  <>

                    <h4 style={{ marginTop: "20px" }}>
                      Select Time
                    </h4>

                    <div className="slot-grid">

                      {slots.map(slot => {

                        const isBooked =
                          bookedSlots.includes(slot);

                        const isBlocked =
                          blockedSlots.includes(slot);

                        const isPast =
                          isPastTime(slot);

                        return (

                          <button
                            key={slot}

                            disabled={
                              isBooked ||
                              isBlocked ||
                              isPast
                            }

                            className={`slot-btn
                              ${selectedSlot === slot ? "selected" : ""}
                              ${isBooked ? "booked" : ""}
                              ${isBlocked ? "blocked" : ""}
                              ${isPast ? "past" : ""}
                            `}

                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>

                  </>
                )}

                {selectedSlot && (
                  <>

                    <textarea
                      placeholder="Enter reason..."
                      value={reason}

                      onChange={(e) =>
                        setReason(e.target.value)
                      }

                      style={{
                        width: "100%",
                        minHeight: "90px",
                        padding: "10px",
                        borderRadius: "10px",
                        marginTop: "20px",
                        border: "1px solid #ccc"
                      }}
                    />

                    <br /><br />

                    <center>

                      <button
                        className="book-btn"
                        onClick={handleBooking}
                      >
                        {t("Confirm Appointment")}
                      </button>

                    </center>

                  </>
                )}

              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}