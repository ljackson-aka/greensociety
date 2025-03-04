import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import StrainForm from "./StrainForm";
import UserEntries from "./UserEntries";
import StrainStats from "./StrainStats";
import XPProgressBar from "./XPProgressBar";
import TrailblazerBadge from "./TrailblazerBadge";
import Leaderboard from "./Leaderboard";
import SignIn from "./SignIn";
import "./App.css";
import { Auth } from "aws-amplify";

const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [isTrailblazer, setIsTrailblazer] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);
  // View can be: "home", "signin", "dashboard", or "leaderboard"
  const [view, setView] = useState("home");

  // Check for an authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUserId(user.attributes.email);
        // Set isTrailblazer based on Cognito custom attribute
        setIsTrailblazer(user.attributes["custom:isTrailblazer"] === "true");
      } catch (error) {
        setUserId(null);
      }
    };
    fetchUser();
  }, [view]);

  // Listen for URL hash changes to determine which view to show.
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#leaderboard") {
        setView("leaderboard");
      } else if (hash === "#profile") {
        setView("dashboard");
      } else if (hash === "#signin") {
        setView("signin");
      } else if (hash === "#home") {
        setView("home");
      } else {
        // Default view: if signed in, show dashboard; otherwise, home.
        setView(userId ? "dashboard" : "home");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [userId]);

  // Fetch entries if a user is signed in
  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const requestUrl = `${API_URL}?user_id=${encodeURIComponent(userId)}&t=${Date.now()}`;
      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
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

  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId, refresh, fetchEntries]);

  const handleEntryLogged = () => {
    setRefresh(prev => !prev);
  };

  const previousStrains = [...new Set(entries.map(entry => entry.strain_name))];

  const renderContent = () => {
    if (view === "home") {
      return (
        <div className="landing">
          <h1>Join Club Redstone</h1>
          <p>1. No backlogging. If you forget to log a smoke session, move on and get better. 2. Rank up.</p>
          <p>Please sign in or sign up to play.</p>
        </div>
      );
    } else if (view === "signin") {
      return (
        <SignIn
          onSignIn={() => {
            window.location.hash = "#dashboard";
            window.location.reload();
          }}
        />
      );
    } else if (view === "leaderboard") {
      return <Leaderboard />;
    } else if (view === "dashboard") {
      return (
        <div className="main-content">
          <div className="submission-form">
            <StrainForm
              userId={userId}
              onEntryLogged={handleEntryLogged}
              previousStrains={previousStrains}
            />
          </div>
          <div className="xp-container">
            <XPProgressBar userId={userId} triggerUpdate={refresh} />
          </div>
          <div className="badges-box">
            <h3>Badges</h3>
            {/* Use the isTrailblazer state from Cognito */}
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
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      {renderContent()}
    </div>
  );
};

export default App;
