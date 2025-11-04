import React, { useState } from "react";
import axios from "../utils/axios";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/user/login", { email, password });

      const { token, user } = res.data;

      // ✅ Store both token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect to home or dashboard
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.stack);
      const msg = err.response?.data?.error || "Login failed";
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" >
        <h2>Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="true"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button onClick={handleLogin}>Login</button>
        <a href="/register" style={{ textAlign: "center", marginTop: '10px' }}>don't have account? create here</a>
      </form>
    </div>
  );
};

export default Login;
