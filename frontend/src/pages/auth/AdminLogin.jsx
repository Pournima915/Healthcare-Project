import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

const AdminLogin = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@telemed.com" && password === "admin123") {
      localStorage.setItem("adminAuth", JSON.stringify({ email }));
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Admin Login</h2>

        <input
          type="email"
          placeholder="Enter Email *"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password *"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: "45px" }}
            required
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "1px",
              top: "35%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "25px",
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
