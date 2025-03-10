// Speak.js
import React, { useState } from "react";

const EMAIL_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/send-email"; // Update with your endpoint

const Speak = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(EMAIL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY_HERE" // Replace with your actual API key
        },
        body: JSON.stringify({ subject, body, dry_run: dryRun })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Emails processed successfully!");
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("An error occurred: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="speak-page">
      <h2>Send Mass Email</h2>
      <form onSubmit={handleSubmit} className="speak-form">
        <div className="form-group">
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
            />
            Dry Run (simulate sending)
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Emails"}
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Speak;
