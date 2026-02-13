import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import "./PatientLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@telemed.com" && password === "admin123") {
      // ✅ STORE ADMIN AUTH (MATCH DASHBOARD CHECK)
      localStorage.setItem(
        "adminAuth",
        JSON.stringify({ email })
      );

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
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
