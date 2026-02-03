import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/leaderboard.css";
import { API_BASE } from "../apiBase";

function Leaderboard() {
  const accessToken = localStorage.getItem("access");
  const user = localStorage.getItem("user");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    setMessage("");
    const res = await fetch(`${API_BASE}/api/leaderboard/`);
    if (!res.ok) {
      setMessage("Failed to load leaderboard");
      return;
    }
    const data = await res.json();
    setRows(data);
  };

  const fetchMe = async () => {
    if (!accessToken) return;
    const res = await fetch(`${API_BASE}/api/leaderboard/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return;
    const data = await res.json();
    setMe(data);
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchMe();
  }, []);

  return (
    <div className="leaderboard-page">
      <h2>Top 5 Members (Last 24 Hours)</h2>
      {message && <p>{message}</p>}
      {rows.length === 0 && !message && <p>No karma yet</p>}
      {accessToken && user && (
        <div className="me-card">
          <div className="me-rank">
            {me && me.rank ? `You are ranked #${me.rank}` : "You have no rank yet"}
          </div>
          {me && <div className="me-karma">Your karma: {me.karma ?? 0}</div>}
          <Link to="/profile" className="profile-link">View profile</Link>
        </div>
      )}
      <div className="leaderboard-list">
        {rows.map((row, idx) => (
          <div
            key={row.user__username}
            className={`leaderboard-row ${me && me.username === row.user__username ? "highlight" : ""}`}
          >
            <span className="rank">#{idx + 1}</span>
            <button
              type="button"
              className="name-link"
              onClick={() => {
                if (!accessToken || !user) {
                  navigate("/login");
                  return;
                }
                navigate("/profile");
              }}
            >
              {row.user__username}
            </button>
            <span className="karma">{row.karma} karma</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
