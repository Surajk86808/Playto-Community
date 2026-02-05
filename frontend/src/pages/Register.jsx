import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ ADD THIS
import "../styles/auth.css";
import { API_BASE } from "../apiBase";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();                 // ✅ ADD THIS

  const register = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/accounts/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      setMessage("Server error");
      return;
    }

    if (!res.ok) {
      setMessage(data.error || "Registration failed");
      return;
    }

    if (data.access) {
      localStorage.setItem("access", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh);
    }
    localStorage.setItem("user", username);
    setMessage("Registered successfully");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  return (
    <form onSubmit={register} className="auth">
      <h3>Register</h3>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Register</button>

      <p>{message}</p>
    </form>
  );
}

export default Register;
