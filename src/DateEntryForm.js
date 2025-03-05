import React, { useState } from "react";
import "./DateEntryForm.css";

const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/comments";

const DateEntryForm = ({ userId, onCommentSubmitted }) => {
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          comment: commentText
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setCommentText("");
      if (onCommentSubmitted) onCommentSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="date-entry-form">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Comment"}
        </button>
      </form>
      {error && <p className="error">Error: {error}</p>}
    </div>
  );
};

export default DateEntryForm;
