import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorProfile.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    mobile: "",
    fee: "",
    state: "",
    district: "",
    area: "",
    profileImage: null,
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("doctorAuth"));

    if (data) {
      setDoctor(data);

      setForm({
        name: data.name || "",
        specialization: data.specialization || "",
        mobile: data.mobile || "",
        fee: data.fee || "",
        state: data.state || "",
        district: data.district || "",
        area: data.area || "",
        profileImage: null,
      });
    }
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, profileImage: e.target.files[0] });
  };

  // ================= UPDATE =================
  const updateProfile = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });

      const res = await axios.put(
        "http://localhost:5000/api/doctor/update-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Update localStorage instantly
      localStorage.setItem("doctorAuth", JSON.stringify(res.data));

      setDoctor(res.data);

      alert("✅ Profile Updated");

    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  if (!doctor) return null;

  // ================= IMAGE =================
  const getImage = () => {
    return doctor.profileImage
      ? `http://localhost:5000/${doctor.profileImage}?t=${Date.now()}`
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  };

  return (
    <div className="profile-container">
      <h2>👨‍⚕️ Doctor Profile</h2>

      <div className="profile-card">

        <img src={getImage()} className="profile-img" alt="doctor" />

        <label>Upload Photo</label>
        <input type="file" onChange={handleFile} />

        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Specialization</label>
        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
        />

        <label>Mobile</label>
        <input name="mobile" value={form.mobile} onChange={handleChange} />

        <label>Consultation Fee</label>
        <input name="fee" value={form.fee} onChange={handleChange} />

        <label>State</label>
        <input name="state" value={form.state} onChange={handleChange} />

        <label>District</label>
        <input name="district" value={form.district} onChange={handleChange} />

        <label>Area</label>
        <input name="area" value={form.area} onChange={handleChange} />

        <button onClick={updateProfile}>Update Profile</button>
      </div>
    </div>
  );
}