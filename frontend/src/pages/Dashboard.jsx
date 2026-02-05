import { useEffect, useState } from "react";
import { API_BASE } from "../apiBase";
import "../styles/dashboard.css";

function Dashboard() {
  const user = localStorage.getItem("user");
  const accessToken = localStorage.getItem("access");

  const [posts, setPosts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

  const showLoginPopup = (text) => {
    // Simple popup warning
    window.alert(text);
  };

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // 🔹 Fetch posts from backend
  const fetchPosts = async () => {
    const res = await fetch(`${API_BASE}/posts/?limit=10`);
    const data = await safeJson(res);
    if (!data) {
      setMessage("Server error (not JSON)");
      return;
    }
    if (user) {
      setPosts(data.filter((post) => post.user === user));
    } else {
      setPosts(data);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔹 Handle image selection
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // 🔹 Create post
  const createPost = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!imageFile && !content.trim()) {
      setMessage("Please add content or an image");
      return;
    }

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    if (content.trim()) formData.append("content", content.trim());

    const res = await fetch(`${API_BASE}/posts/`, {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        setMessage("Unauthorized: please login again");
      } else {
        setMessage("Post upload failed");
      }
      return;
    }

    setMessage("Post uploaded");
    setImageFile(null);
    setContent("");
    fetchPosts();
  };

  const loadComments = async (postId) => {
    const res = await fetch(`${API_BASE}/comments/post/${postId}/`);
    const data = await safeJson(res);
    if (!data) {
      setMessage("Server error (not JSON)");
      return;
    }
    setCommentsByPost((prev) => ({ ...prev, [postId]: data }));
  };

  const submitComment = async (postId, parentId = null) => {
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft) return;
    if (!accessToken) {
      showLoginPopup("Please login to comment");
      return;
    }

    const res = await fetch(`${API_BASE}/comments/post/${postId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      body: JSON.stringify({ content: draft, parent_id: parentId }),
    });

    if (!res.ok) {
      setMessage(res.status === 401 ? "Unauthorized: please login again" : "Comment failed");
      return;
    }

    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    loadComments(postId);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome, {user} 👋</h2>
          <p className="dashboard-subtitle">Share an update or drop a photo from your day.</p>
        </div>
        <div className="dashboard-stats">
          <span>Total Posts</span>
          <strong>{posts.length}</strong>
        </div>
      </div>

      <form className="post-box" onSubmit={createPost}>
        <div className="post-inputs">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" className="post-btn">Post</button>
      </form>

      {message && <p className="dashboard-message">{message}</p>}

      {/* Posts */}
      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-meta">
              <strong>{post.user}</strong>
              <span> • {post.created_at}</span>
            </div>
            {post.content && <p>{post.content}</p>}
            {post.image && <img src={post.image} alt="post" />}
            <div className="post-actions">
              <span>Likes: <strong>{post.like_count ?? 0}</strong></span>
              <button type="button" className="comment-btn" onClick={() => loadComments(post.id)}>
                Load comments
              </button>
            </div>
            <div className="comment-box">
              <input
                placeholder="Write a comment..."
                value={commentDrafts[post.id] || ""}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
              />
              <button type="button" onClick={() => submitComment(post.id)}>
                Comment
              </button>
            </div>
            <div className="comment-list">
              {(commentsByPost[post.id] || []).map((c) => (
                <div key={c.id} className="comment-item">
                  <strong>{c.author}</strong>: {c.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
