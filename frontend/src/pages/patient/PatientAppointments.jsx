import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../../socket";
import "./PatientAppointments.css";
import { useTranslation } from "react-i18next";

export default function PatientAppointments() {
  const { t } = useTranslation();

  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const navigate = useNavigate();

  // =============================
  // LOAD PATIENT
  // =============================
  useEffect(() => {
    const stored = localStorage.getItem("patientAuth");
    if (stored) {
      const p = JSON.parse(stored);
      setPatient(p);

      socket.emit("join-room", p.email);
    }
  }, []);

  // =============================
  // FETCH APPOINTMENTS
  // =============================
  const loadAppointments = async (email) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointment/patient/${email.trim().toLowerCase()}`
      );

      setAppointments(res.data || []);
    } catch (err) {
      console.log("❌ Fetch error:", err);
    }
  };

  // =============================
  // LOAD DOCTORS
  // =============================
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/doctor/all")
      .then((res) => setDoctors(res.data || []))
      .catch((err) => console.log(err));
  }, []);

  // =============================
  // REALTIME + LOAD
  // =============================
  useEffect(() => {
    if (!patient?.email) return;

    loadAppointments(patient.email);

    socket.on("notification", () => {
      loadAppointments(patient.email);
    });

    return () => {
      socket.off("notification");
    };
  }, [patient]);

  return (
    <div className="pa-container">
      <h2>📅 {t("appointments")}</h2>

      {appointments.length === 0 ? (
        <p>{t("noAppointments") || "No appointments yet."}</p>
      ) : (
        <table className="pa-table">
          <thead>
            <tr>
              <th>{t("doctor") || "Doctor"}</th>
              <th>{t("date") || "Date"}</th>
              <th>{t("time") || "Time"}</th>
              <th>{t("status") || "Status"}</th>
              <th>{t("message") || "Message"}</th>
            </tr>
          </thead>

          <tbody>
            {appointments
              .filter((a) => {
                const today = new Date();
                const apptDate = new Date(a.date);

                return apptDate >= new Date(today.setHours(0, 0, 0, 0));
              })
              .map((a) => {
                const status = (a.status || "pending").toLowerCase();

                return (
                  <tr key={a._id}>
                    <td>
                      {doctors.find(
                        (d) =>
                          d.email?.trim().toLowerCase() ===
                          a.doctorEmail?.trim().toLowerCase()
                      )?.name || a.doctorEmail}
                    </td>

                    <td>{a.date}</td>

                    <td>
                      {a.startTime && a.endTime
                        ? `${a.startTime} - ${a.endTime}`
                        : t("notSet") || "Not set"}
                    </td>

                    <td>
                      <span className={`status ${status}`}>
                        {status === "pending" && (t("waiting") || "Waiting")}
                        {status === "accepted" && (t("accepted") || "Accepted")}
                        {status === "rescheduled" &&
                          (t("rescheduled") || "Rescheduled")}
                      </span>
                    </td>

                    <td>
                      {status === "pending" &&
                        (t("waitingApproval") ||
                          "⏳ Waiting for doctor approval")}
                      {status === "accepted" &&
                        (t("confirmed") ||
                          "✅ Appointment confirmed")}
                      {status === "rescheduled" &&
                        (t("rescheduledMsg") ||
                          "🔁 Appointment rescheduled")}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}
