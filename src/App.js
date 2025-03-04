import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import StrainForm from "./StrainForm";
import UserEntries from "./UserEntries";
import StrainStats from "./StrainStats";
import XPProgressBar from "./XPProgressBar"; // XP progress bar component
import TrailblazerBadge from "./TrailblazerBadge"; // Trailblazer badge component
import "./App.css";
import { Auth } from "aws-amplify";

const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState(""); // preferred_username or email
  const [isTrailblazer, setIsTrailblazer] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false); // Trigger re-fetch after entry is logged

  // Get authenticated user info from Cognito
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUserId(user.attributes.email);
        setDisplayName(user.attributes.preferred_username || user.attributes.email);
        // Check custom attribute "custom:isTrailblazer"
        setIsTrailblazer(user.attributes["custom:isTrailblazer"] === "true");
      } catch (error) {
        console.log("Error fetching user: ", error);
      }
    };
    fetchUser();
  }, []);

  // Wrap fetchEntries in useCallback to avoid dependency warnings.
  const fetchEntries = useCallback(async () => {
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
  }, [userId]);

  // Refetch entries (and XP) when userId, refresh, or fetchEntries changes.
  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId, refresh, fetchEntries]);

  // Called when a new entry is successfully logged.
  const handleEntryLogged = () => {
    setRefresh((prev) => !prev);
  };

  // Compute unique strains for autocomplete in the form.
  const previousStrains = [...new Set(entries.map((entry) => entry.strain_name))];

  return (
    <div className="app-container">
      <Navbar userId={displayName} />
      {userId ? (
        <div className="main-content">
          <div className="submission-form">
            <StrainForm
              userId={userId}
              onEntryLogged={handleEntryLogged}
              previousStrains={previousStrains}
            />
          </div>
          {/* XP progress bar container stretches full width with centered text */}
          <div className="xp-container">
            <XPProgressBar userId={userId} triggerUpdate={refresh} />
          </div>

          {/* Badges Section */}
          <div className="badges-box">
            <h3>Badges</h3>
            <TrailblazerBadge isTrailblazer={isTrailblazer} />
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
              {/* Uncomment the Load More button if needed */}
              {/* <button className="load-more-button">Load More</button> */}
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
