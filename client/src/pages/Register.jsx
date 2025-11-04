import React, { useState } from "react";
import axios from "../utils/axios";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/user/register", {
        email,
        password,
        name,
      });

      const { token, user } = res.data;

      // ✅ Store both token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect to home or dashboard
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err.stack);
      const msg = err.response?.data?.error || "Registration failed";
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        {error && <p className="auth-error">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <a href="/login" style={{ textAlign: "center", marginTop: "10px" }}>
          already have account? login here
        </a>
      </form>
    </div>
  );
};

export default Register;
