import "../auth.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";


function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Telemedicine Login</h2>

        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button>Login</button>

        <p>
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

