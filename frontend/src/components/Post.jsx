import { Link } from "react-router-dom";
import "../styles/post.css";

function Post() {
  return (
    <div className="post">
      <h4>Person Name</h4>
      <small>2 hours ago</small>

      <div className="image-box">IMAGE</div>

      <div className="actions">
      <span className="like">❤️ 12 likes</span>
       <Link className="comment-link" to="/comments/1">
             💬 comments
       </Link>
        </div>
    </div>
  );
}

export default Post;
