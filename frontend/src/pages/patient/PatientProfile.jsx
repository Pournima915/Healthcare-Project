import React, { useState } from "react";
import axios from "axios";
import "./PatientProfile.css";

export default function PatientProfile({ patient }) {

  const [form, setForm] = useState({
    name: patient?.name || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    dob: patient?.dob || "",
    photo: null,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    setForm({
      ...form,
      photo: e.target.files[0],
    });
  };

 const updateProfile = async () => {
  try {
    const data = new FormData();

    Object.keys(form).forEach(key => {
      if (form[key]) data.append(key, form[key]);
    });

    await axios.put(
  "http://localhost:5000/api/patient/update-profile",
  data,
  {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  }
);

    // ✅ Update UI instantly
    localStorage.setItem("patientAuth", JSON.stringify({ ...patient, ...form }));

    alert("✅ Profile Updated");
    window.location.reload();

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="profile-container">
      <h2>👤 Patient Profile</h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full Name"
      />

      <input
        name="email"
        value={form.email}
        readOnly
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Mobile Number"
      />

      <input
        type="date"
        name="dob"
        value={form.dob}
        onChange={handleChange}
      />

      {/* PHOTO */}
      <input type="file" onChange={handleFile} />

      <button onClick={updateProfile}>
        Update Profile
      </button>
    </div>
  );

  
}