import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { API_BASE } from "../apiBase";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    let res;
    try {
      res = await fetch(`${API_BASE}/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
    } catch (err) {
      setMessage("Cannot reach server");
      console.error(err);
      return;
    }

    // 🔴 SAFETY: backend may return HTML (403, 500, etc.)
    let data;
    try {
      data = await res.json();
    } catch {
      setMessage("Server error (not JSON)");
      return;
    }

    if (!res.ok) {
      setMessage(data.error || "Login failed");
      return;
    }

    // ✅ SUCCESS
    localStorage.setItem("user", username);
    if (data.access) {
      localStorage.setItem("access", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh);
    }
    navigate("/");
    window.location.reload(); // force UI refresh (simple & effective)
  };

  return (
    <form onSubmit={login} className="auth">
      <h3>Login</h3>

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

      <button type="submit">Login</button>

      {message && <p>{message}</p>}
    </form>
  );
}

export default Login;
