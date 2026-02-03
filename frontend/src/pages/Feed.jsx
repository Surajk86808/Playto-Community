import "../styles/feed.css";
import "../styles/post.css";
import { useEffect, useState } from "react";

function Feed() {
  const accessToken = localStorage.getItem("access");
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyToByPost, setReplyToByPost] = useState({});
  const [openCommentsByPost, setOpenCommentsByPost] = useState({});
  const [message, setMessage] = useState("");
  const [commentErrorByPost, setCommentErrorByPost] = useState({});

  const fetchPosts = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/posts/?limit=10");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const loadComments = async (postId) => {
    const res = await fetch(`http://127.0.0.1:8000/api/comments/post/${postId}/`);
    const data = await res.json();
    setCommentsByPost((prev) => ({ ...prev, [postId]: data }));
    setOpenCommentsByPost((prev) => ({ ...prev, [postId]: true }));
  };

  const likePost = async (postId) => {
    setMessage("");
    if (!accessToken) {
      setMessage("Please login to like posts");
      return;
    }
    const res = await fetch(`http://127.0.0.1:8000/api/likes/post/${postId}/`, {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        setMessage("Unauthorized: please login again");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Like failed");
      }
      return;
    }

    fetchPosts();
  };

  const submitComment = async (postId) => {
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft) return;
    if (!accessToken) {
      setCommentErrorByPost((prev) => ({
        ...prev,
        [postId]: "Unauthorized: please login again",
      }));
      return;
    }

    const res = await fetch(`http://127.0.0.1:8000/api/comments/post/${postId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      body: JSON.stringify({
        content: draft,
        parent_id: replyToByPost[postId] || null,
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        setCommentErrorByPost((prev) => ({
          ...prev,
          [postId]: "Unauthorized: please login again",
        }));
      } else {
        setCommentErrorByPost((prev) => ({
          ...prev,
          [postId]: "Comment failed",
        }));
      }
      return;
    }

    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    setCommentErrorByPost((prev) => ({ ...prev, [postId]: "" }));
    setReplyToByPost((prev) => ({ ...prev, [postId]: null }));
    loadComments(postId);
    fetchPosts();
  };

  const renderComment = (comment, postId, level = 0) => {
    return (
      <div key={comment.id} className="comment-item" style={{ marginLeft: level * 16 }}>
        <div>
          <strong>{comment.author}</strong>: {comment.content}
        </div>
        <button type="button" className="comment-reply" onClick={() => setReplyToByPost((prev) => ({ ...prev, [postId]: comment.id }))}>
          Reply
        </button>
        {comment.children && comment.children.length > 0 && (
          <div>
            {comment.children.map((child) => renderComment(child, postId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="feed">
      {message && <p>{message}</p>}
      {posts.map((post) => (
        <div key={post.id} className="post">
          <h4>{post.user}</h4>
          <small>{post.created_at}</small>

          {post.content && <p>{post.content}</p>}
          {post.image && (
            <img className="post-image" src={`http://127.0.0.1:8000${post.image}`} alt="post" />
          )}

          <div className="actions">
            <button type="button" className="like" onClick={() => likePost(post.id)} disabled={!accessToken}>
              ❤ {post.like_count ?? 0} likes
            </button>
            <button type="button" className="comment-link" onClick={() => loadComments(post.id)}>
              {openCommentsByPost[post.id] ? "Refresh comments" : "Comments"}
            </button>
          </div>

          {openCommentsByPost[post.id] && (
            <div>
              <div className="comment-box">
                <input
                  placeholder={replyToByPost[post.id] ? "Reply..." : "Write a comment..."}
                  value={commentDrafts[post.id] || ""}
                  onChange={(e) =>
                    setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                  disabled={!accessToken}
                />
                <button type="button" onClick={() => submitComment(post.id)} disabled={!accessToken}>
                  Post
                </button>
                {replyToByPost[post.id] && (
                  <button type="button" onClick={() => setReplyToByPost((prev) => ({ ...prev, [post.id]: null }))}>
                    Cancel reply
                  </button>
                )}
              </div>
              {commentErrorByPost[post.id] && (
                <div className="comment-error">{commentErrorByPost[post.id]}</div>
              )}

              <div>
                {(commentsByPost[post.id] || []).map((c) => renderComment(c, post.id))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Feed;
