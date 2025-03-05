// Comms.js
import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import "./Comms.css";

const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/comms";

const Comms = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Fetch comms content from the backend.
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setContent(data.content || "");
      } catch (err) {
        setError("Failed to load comms content: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Check if the current user is an admin.
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const groups = user.signInUserSession.accessToken.payload["cognito:groups"] || [];
        setIsAdmin(groups.includes("Admin"));
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  const handleEdit = () => {
    setEditContent(content);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setContent(data.content || editContent);
      setEditing(false);
    } catch (err) {
      setError("Failed to update content: " + err.message);
    }
  };

  if (loading) return <p>Loading comms content...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="comms-container">
      <h1>Comms Page</h1>
      {!editing ? (
        <>
          <div className="comms-content">{content}</div>
          {isAdmin && (
            <button onClick={handleEdit} className="edit-btn">
              Edit Content
            </button>
          )}
        </>
      ) : (
        <>
          <textarea
            className="edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="10"
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">
              Save
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Comms;
