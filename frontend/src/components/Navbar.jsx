import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("user");

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-title">
          Playto Community
        </Link>

        <div className="navbar-actions">
          {!isLoggedIn ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/leaderboard">Leaderboard</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
