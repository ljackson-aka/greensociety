import React, { useState, useEffect } from "react";
import "./UserComments.css";

const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/comments";

const UserComments = ({ userId, refresh }) => {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}?user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        let data = await response.json();
        if (typeof data.body === "string") {
          data = JSON.parse(data.body);
        }
        // Sort comments in descending order by timestamp
        const sortedComments = Array.isArray(data)
          ? data.sort((a, b) => b.timestamp - a.timestamp)
          : [];
        setComments(sortedComments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [userId, refresh]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <div className="user-comments">
      <h3>Private Journal:</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <>
          <ul>
            {visibleComments.map((comment) => (
              <li key={comment.timestamp}>
                <strong>{new Date(comment.timestamp * 1000).toLocaleString()}:</strong> {comment.comment}
              </li>
            ))}
          </ul>
          {visibleCount < comments.length && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={loadMore}>
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserComments;
