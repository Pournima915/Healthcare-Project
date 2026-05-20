import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [useAutoLocation, setUseAutoLocation] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    gender: "",
    hospital: "",
    experience: "",
    qualification: "",
    specialization: "",
    licenseNo: "",
    certificate: null,
    state: "",
    district: "",
    area: "",
  });

  const [otherSpecialization, setOtherSpecialization] = useState("");
  const fileInput = useRef(null);
  const [errors, setErrors] = useState({});

  // ✅ SPECIALIZATION OPTIONS
  const specializations = [
    "Dentist",
    "Cardiologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "Gynecologist",
    "Psychiatrist",
    "General Physician",
    "Other",
  ];

  // ✅ STATES + DISTRICTS (example)
  const statesData = {
    Maharashtra: ["Ahilyanagar (Ahmednagar)","Akola","Amravati","Beed","Bhandara","Buldhana","Chandrapur","Chhatrapati Sambhajinagar (Aurangabad)","Dharashiv (Osmanabad)","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
    Gujarat: ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kachchh (Kutch)","Kheda","Mahisagar","Mehsana","Morbi","Narmada","Navsari",  "Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
    Karnataka: ["Bagalkot","Ballari (Bellary)","Belagavi (Belgaum)","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi (Gulbarga)","Kodagu","Kolar","Koppal","Mandya","Mysuru (Mysore)","Raichur","Ramanagara","Shivamogga (Shimoga)","Tumakuru (Tumkur)","Udupi","Uttara Kannada","Vijayapura (Bijapur)","Vijayanagara","Yadgir "],
    Rajasthan: ["Jaipur", "Jodhpur", "Kota", "Ajmer", "Udaipur", "Bikaner", "Alwar", "Bhilwara", "Barmer", "Nagaur", "Chittorgarh"],
    TamilNadu: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli","Erode", "Vellore", "Thanjavur", "Kanchipuram"
  ]
  };

  // =============================
  // AUTO LOCATION
  // =============================
  const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();

      console.log("FULL LOCATION DATA:", data); // 🔍 debug

      // ✅ FIX: handle multiple possible fields
      const state =
        data.address.state ||
        data.address.region ||
        "";

      const district =
        data.address.county ||
        data.address.city ||
        data.address.district ||
        data.address.state_district ||
        "";

      const area =
        data.address.suburb ||
        data.address.neighbourhood ||
        data.address.village ||
        data.address.road ||
        data.address.hamlet ||
        "";

      setForm((prev) => ({
        ...prev,
        state,
        district,
        area,
      }));

      alert(" Location fetched successfully");

    } catch (err) {
      console.log(err);
      alert("Failed to fetch location");
    }
  });
};

  // =============================
  // VALIDATION
  // =============================
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name required";

    if (!form.email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email))
      newErrors.email = "Valid Gmail required";

    if (!form.password || form.password.length < 6)
      newErrors.password = "Min 6 characters required";

    if (!form.mobile || !/^[0-9]{10}$/.test(form.mobile))
      newErrors.mobile = "10 digit mobile required";

    if (!form.gender) newErrors.gender = "Select gender";

    if (!form.hospital) newErrors.hospital = "Hospital required";

    if (!form.experience) newErrors.experience = "Experience required";

    if (!form.qualification)
      newErrors.qualification = "Qualification required";

    if (!form.specialization)
      newErrors.specialization = "Select specialization";

    if (
      form.specialization === "Other" &&
      !otherSpecialization.trim()
    ) {
      newErrors.specialization = "Enter specialization";
    }

    if (!form.licenseNo) newErrors.licenseNo = "License required";

    if (!form.state) newErrors.state = "Select state";
    if (!form.district) newErrors.district = "Select district";
    if (!form.area) newErrors.area = "Enter area";

    return newErrors;
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;

    try {
      const formData = new FormData();

      const finalSpecialization =
        form.specialization === "Other"
          ? otherSpecialization
          : form.specialization;

      Object.keys(form).forEach((key) => {
        if (key === "specialization") {
          formData.append("specialization", finalSpecialization);
        } else {
          formData.append(key, form[key]);
        }
      });

      const res = await fetch(
        "http://localhost:5000/api/doctor/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error);
        return;
      }

      alert("Doctor Registered ✅");
      navigate("/doctor/login");

    } catch (err) {
      console.log(err);
    }
  };

  // =============================
  // HANDLE CHANGE
  // =============================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "certificate") {
      setForm({ ...form, certificate: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Doctor Registration</h2>

        <input name="name" placeholder="Full Name *"
          className="login-input"
          value={form.name}
          onChange={handleChange}
        />

        <input name="email" placeholder="Gmail *"
          className="login-input"
          value={form.email}
          onChange={handleChange}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password *"
            className="login-input"
            value={form.password}
            onChange={handleChange}
          />
          <span onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 10, top: 12, cursor: "pointer" }}>
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <input name="mobile" placeholder="Mobile *"
          className="login-input"
          value={form.mobile}
          onChange={handleChange}
        />

        <select name="gender" className="login-input"
          value={form.gender}
          onChange={handleChange}>
          <option value="">Select Gender *</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input name="hospital" placeholder="Hospital *"
          className="login-input"
          value={form.hospital}
          onChange={handleChange}
        />

        {/* EXPERIENCE FIX */}
        <input
          type="number"
          name="experience"
          placeholder="Experience (Years) *"
          className="login-input"
          value={form.experience}
          onChange={handleChange}
        />

        <input name="qualification" placeholder="Qualification *"
          className="login-input"
          value={form.qualification}
          onChange={handleChange}
        />

        {/* SPECIALIZATION */}
        <select
          name="specialization"
          className="login-input"
          value={form.specialization}
          onChange={handleChange}
        >
          <option value="">Select Specialization *</option>
          {specializations.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>

        {form.specialization === "Other" && (
          <input
            className="login-input"
            placeholder="Enter specialization"
            value={otherSpecialization}
            onChange={(e) => setOtherSpecialization(e.target.value)}
          />
        )}

        <input name="licenseNo" placeholder="License No *"
          className="login-input"
          value={form.licenseNo}
          onChange={handleChange}
        />

        {/* STATE */}
        <select
          name="state"
          className="login-input"
          value={form.state}
          onChange={handleChange}
        >
          <option value="">Select State *</option>
          {Object.keys(statesData).map((state, i) => (
            <option key={i}>{state}</option>
          ))}
        </select>

        {/* DISTRICT */}
        <select
          name="district"
          className="login-input"
          value={form.district}
          onChange={handleChange}
        >
          <option value="">Select District *</option>
          {(statesData[form.state] || []).map((d, i) => (
            <option key={i}>{d}</option>
          ))}
        </select>

        {/* AREA */}
        <input
          name="area"
          placeholder="Area / Locality *"
          className="login-input"
          value={form.area}
          onChange={handleChange}
        />

        {/* FILE */}
        <input
          type="file"
          name="certificate"
          className="login-input"
          onChange={handleChange}
        />

        <button className="login-btn">Register</button>

        <p className="login-footer">
          Already registered?{" "}
          <span className="login-link"
          onClick={() => navigate("/doctor/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default DoctorRegister;