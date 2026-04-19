import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

const DoctorLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      newErrors.email = "Enter valid Gmail address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];

    if (!Array.isArray(doctors)) {
      setErrors({ general: "Doctor data corrupted" });
      return;
    }

    const doctor = doctors.find(
      (d) =>
        d.email.toLowerCase() === email.toLowerCase() &&
        d.password === password
    );

    if (!doctor) {
      setErrors({ general: "Invalid email or password" });
      return;
    }

    if (doctor.status !== "approved") {
      setErrors({ general: "Account not approved by admin yet" });
      return;
    }

    // ✅ VERY IMPORTANT
    localStorage.setItem("doctorAuth", JSON.stringify(doctor));
    localStorage.setItem("doctorToken", "true"); // <-- required for ProtectedRoute

    navigate("/doctor/dashboard");
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Doctor Login</h2>

        <input
          type="text"
          placeholder="Gmail *"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password *"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        {errors.general && <p className="error">{errors.general}</p>}

        <button type="submit" className="login-btn">
          Login
        </button>

        <p className="login-footer">
          Not registered?{" "}
          <span
            className="login-link"
            onClick={() => navigate("/doctor/register")}
          >
            Register Here
          </span>
        </p>
      </form>
    </div>
  );
};

export default DoctorLogin;
