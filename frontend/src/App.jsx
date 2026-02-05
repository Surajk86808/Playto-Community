import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import {
  clearAuth,
  getAccessToken,
  getUser,
  isTokenExpired,
  scheduleAutoLogout,
} from "./auth";

function App() {
  const navigate = useNavigate();
  const token = getAccessToken();
  const user = getUser();
  const isLoggedIn = !!user && !!token && !isTokenExpired(token);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!token) return;
    if (isTokenExpired(token)) {
      logout();
      return;
    }

    const timer = scheduleAutoLogout(logout);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token]);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
