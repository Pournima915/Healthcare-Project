import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

export default function PatientRegister() {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",        
    email: "",
    password: "",
    mobile: "",      
    gender: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const validate = () => {
    let newErrors = {};

    if (!form.name.trim())
      newErrors.name = "Full Name is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) {
      newErrors.email = "Enter a valid Gmail address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile Number required";
    } else if (form.mobile.length !== 10) {
      newErrors.mobile = "Mobile must be 10 digits";
    }

    if (!form.gender)
      newErrors.gender = "Gender required";

    if (!form.address)
      newErrors.address = "Address required";

    return newErrors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0)
      return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/patient/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message });
        setLoading(false);
        return;
      }

      alert("Patient registered successfully");
      navigate("/patient/login");

    } catch {
      setErrors({ general: "Server error" });
    }

    setLoading(false);
  };


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Patient Registration</h2>

        <input
          name="name"
          placeholder="Full Name *"
          className="login-input"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <input
          name="email"
          placeholder="Gmail *"
          className="login-input"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password *"
            className="login-input"
            value={form.password}
            onChange={handleChange}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "35%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "25px"
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}

        <input
          name="mobile"
          placeholder="Mobile *"
          className="login-input"
          value={form.mobile}
          onChange={handleChange}
        />
        {errors.mobile && <p className="error">{errors.mobile}</p>}

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

        <input
          name="address"
          placeholder="Address *"
          className="login-input"
          value={form.address}
          onChange={handleChange}
        />
        {errors.address && <p className="error">{errors.address}</p>}

        {errors.general && <p className="error">{errors.general}</p>}

        <button className="login-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="login-footer">
          Already registered?{" "}
          <span
            className="login-link"
            onClick={() => navigate("/patient/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
