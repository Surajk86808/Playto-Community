import { useEffect, useState } from "react";

function Profile() {
  const accessToken = localStorage.getItem("access");
  const username = localStorage.getItem("user");
  const [me, setMe] = useState(null);
  const [message, setMessage] = useState("");

  const fetchMe = async () => {
    if (!accessToken) return;
    const res = await fetch("http://127.0.0.1:8000/api/leaderboard/me/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      setMessage("Failed to load profile");
      return;
    }
    const data = await res.json();
    setMe(data);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", background: "white", padding: 20, borderRadius: 14 }}>
      <h2>Profile</h2>
      {!accessToken && <p>Please login to see your profile.</p>}
      {message && <p>{message}</p>}
      {accessToken && (
        <div>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Rank (24h):</strong> {me && me.rank ? `#${me.rank}` : "No rank yet"}</p>
          <p><strong>Karma (24h):</strong> {me ? me.karma : 0}</p>
        </div>
      )}
    </div>
  );
}

export default Profile;
