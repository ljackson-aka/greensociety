import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import StrainForm from "./StrainForm";
import UserEntries from "./UserEntries";
import StrainStats from "./StrainStats";
import "./App.css";
import { Auth } from "aws-amplify";

const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState(""); // Store preferred_username
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  // Get the authenticated user info from Cognito
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUserId(user.attributes.email); // Use email as the unique identifier
        setDisplayName(user.attributes.preferred_username || user.attributes.email); 
        // 👆 Display preferred_username, fallback to email if missing
      } catch (error) {
        console.log("Error fetching user: ", error);
      }
    };
    fetchUser();
  }, []);

  // Function to fetch entries (only runs when user is signed in)
  const fetchEntries = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const requestUrl = `${API_URL}?user_id=${encodeURIComponent(userId)}&t=${Date.now()}`;
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      let rawData = await response.json();
      if (typeof rawData.body === "string") {
        rawData = JSON.parse(rawData.body);
      }
      if (!rawData.data || !Array.isArray(rawData.data)) {
        throw new Error("Unexpected API response format.");
      }
      setEntries(rawData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refetch entries when userId or refresh changes
  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId, refresh]);

  const handleEntryLogged = () => {
    setRefresh(prev => !prev);
  };

  // Compute unique strains for autocomplete
  const previousStrains = [...new Set(entries.map(entry => entry.strain_name))];

  return (
    <div className="app-container">
      <Navbar userId={displayName} /> {/* 👈 Show preferred_username instead of userId */}
      {userId ? (
        <div className="main-content">
          <div className="submission-form">
            <StrainForm 
              userId={userId} 
              onEntryLogged={handleEntryLogged} 
              previousStrains={previousStrains} 
            />
          </div>
          <div className="content">
            <div className="stats-panel">
              <StrainStats entries={entries} />
            </div>
            <div className="entries-panel">
              {loading ? (
                <p className="loading">Loading entries...</p>
              ) : error ? (
                <p className="error">Error: {error}</p>
              ) : (
                <UserEntries entries={entries} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="landing">
          <h1>Welcome to Club Redstone</h1>
          <p>Please sign in or sign up to continue.</p>
        </div>
      )}
    </div>
  );
};

export default App;
