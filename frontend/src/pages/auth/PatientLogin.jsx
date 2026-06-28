import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

export default function PatientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;

    try {
      setLoading(true);
      setErrors({});

      const response = await fetch(
        "http://localhost:5000/api/patient/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Login failed" });
        return;
      }

      localStorage.setItem("patientAuth", JSON.stringify(data.patient));
      localStorage.setItem("token", data.token);

      alert("✅ Login Successful");
      navigate("/patient/dashboard");

    } catch (error) {
      console.error("Login Error:", error);
      setErrors({ general: "Server not running or connection error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleLogin}>
        <h2 className="login-title">Patient Login</h2>

        <input
          type="email"
          placeholder="Email *"
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
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "35%",
              cursor: "pointer",
              fontSize: "22px",
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {errors.password && <p className="error">{errors.password}</p>}
        {errors.general && <p className="error">{errors.general}</p>}

        <button className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="login-footer">
          Not registered?{" "}
          <span
            className="login-link"
            onClick={() => navigate("/patient/register")}
          >
            Register Here
          </span>
        </p>
      </form>
    </div>
  );
}