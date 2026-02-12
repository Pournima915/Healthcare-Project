import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.role === "patient") navigate("/patient/dashboard");
      if (res.data.role === "doctor") navigate("/doctor/dashboard");
      if (res.data.role === "admin") navigate("/admin/dashboard");
    } 
    catch (err) {
  console.log("LOGIN ERROR:", err);
  res.status(500).json({ error: err.message });
}

  };

  return (
    <form onSubmit={submit} style={box}>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Login</button>
    </form>
  );
};

const box = {
  maxWidth: 320,
  margin: "100px auto",
  padding: 20,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 10px 20px rgba(0,0,0,.2)",
};

export default Login;
