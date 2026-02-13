import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
  });

  
  const [errors, setErrors] = useState({});

  // ✅ Validation Function
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) {
      newErrors.email = "Enter valid Gmail address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(form.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.hospital) newErrors.hospital = "Hospital/Clinic name is required";

    if (!form.experience) {
      newErrors.experience = "Experience is required";
    } else if (!/^[0-9]+$/.test(form.experience)) {
      newErrors.experience = "Experience must be in years (digits only)";
    }

    if (!form.qualification)
      newErrors.qualification = "Qualification is required";

    if (!form.specialization)
      newErrors.specialization = "Specialization is required";

    if (!form.licenseNo)
      newErrors.licenseNo = "License number is required";

    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length !== 0) return;

  try {
    const response = await fetch("http://localhost:5000/api/doctor/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        experience: Number(form.experience), // convert to number
      }),
    });

    const data = await response.json();

    if (!response.ok) {
  console.log("Backend Error:", data);
  alert(data.message || data.error);
  return;
}


    alert("Doctor registered successfully. Waiting for admin approval.");
    navigate("/doctor/login");

  } catch (error) {
    console.error(error);
    setErrors({ general: "Server error. Please try again." });
  }
};



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

        {/* Name */}
        <input
          name="name"
          placeholder="Full Name *"
          className="login-input"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error">{errors.name}</p>}

        {/* Email */}
        <input
          name="email"
          placeholder="Gmail *"
          className="login-input"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        {/* Password */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password * (min 6 characters)"
            className="login-input"
            value={form.password}
            onChange={handleChange}
            style={{ paddingRight: "40px" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}

        {/* Mobile */}
        <input
          name="mobile"
          placeholder="Mobile Number *"
          className="login-input"
          value={form.mobile}
          onChange={handleChange}
        />
        {errors.mobile && <p className="error">{errors.mobile}</p>}

        {/* Gender Dropdown */}
        <select
          name="gender"
          className="login-input"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender *</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        {errors.gender && <p className="error">{errors.gender}</p>}

        {/* Hospital */}
        <input
          name="hospital"
          placeholder="Hospital / Clinic Name *"
          className="login-input"
          value={form.hospital}
          onChange={handleChange}
        />
        {errors.hospital && <p className="error">{errors.hospital}</p>}

        {/* Experience */}
        <input
          name="experience"
          placeholder="Experience in Years *"
          className="login-input"
          value={form.experience}
          onChange={handleChange}
        />
        {errors.experience && <p className="error">{errors.experience}</p>}

        {/* Qualification */}
        <input
          name="qualification"
          placeholder="Qualification *"
          className="login-input"
          value={form.qualification}
          onChange={handleChange}
        />
        {errors.qualification && (
          <p className="error">{errors.qualification}</p>
        )}

        {/* Specialization */}
        <input
          name="specialization"
          placeholder="Specialization *"
          className="login-input"
          value={form.specialization}
          onChange={handleChange}
        />
        {errors.specialization && (
          <p className="error">{errors.specialization}</p>
        )}

        {/* License */}
        <input
          name="licenseNo"
          placeholder="Medical License Number *"
          className="login-input"
          value={form.licenseNo}
          onChange={handleChange}
        />
        {errors.licenseNo && <p className="error">{errors.licenseNo}</p>}

        {/* Upload Certificate (Optional) */}
        <label style={{ fontSize: "16px", marginTop: "10px" }}>
          Upload Verification Certificate (Image/PDF)
        </label>
        <input
          type="file"
          name="certificate"
          accept=".jpg,.jpeg,.png,.pdf"
          className="login-input"
          onChange={handleChange}
        />

        <button className="login-btn">Register</button>

        <p className="login-footer">
          Already registered?{" "}
          <span
            className="login-link"
            onClick={() => navigate("/doctor/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default DoctorRegister;
