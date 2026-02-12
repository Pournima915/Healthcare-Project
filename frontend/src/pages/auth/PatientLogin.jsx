import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

export default function PatientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Validation
  const validate = () => {
    let newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  // ✅ Backend Login
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
          }),
        }
      );

      // ✅ Safely handle non-JSON response
      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server returned invalid JSON");
      }

      if (!response.ok) {
        setErrors({ general: data.message || "Login failed" });
        setLoading(false);
        return;
      }

      // ✅ Save token + patient
      localStorage.setItem("patientToken", data.token);
      localStorage.setItem("patientAuth", JSON.stringify(data.patient));

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

        {/* Email */}
        <input
          type="email"
          placeholder="Email *"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        {/* Password */}
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

        {/* General Error */}
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
