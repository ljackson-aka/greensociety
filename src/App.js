import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import StrainForm from "./StrainForm";
import UserEntries from "./UserEntries";
import StrainStats from "./StrainStats";
import XPProgressBar from "./XPProgressBar";
import TrailblazerBadge from "./TrailblazerBadge";
import Leaderboard from "./Leaderboard";
import SignIn from "./SignIn";
import AdminDashboard from "./AdminDashboard";
import DateEntryForm from "./DateEntryForm";
import UserComments from "./UserComments"; // NEW: Displays user comments
import "./App.css";
import { Auth } from "aws-amplify";

const STRAIN_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";


const App = () => {
  const [userId, setUserId] = useState(null);
  const [isTrailblazer, setIsTrailblazer] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshEntries, setRefreshEntries] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const [view, setView] = useState("home");

  // Authenticate user and fetch their Cognito attributes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUserId(user.attributes.email);
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
      } else if (hash === "#admin") {
        setView("admin");
      } else if (hash === "#comms") {
        setView("comms");
      } else if (hash === "#merch") {
        setView("merch");
      } else {
        setView(userId ? "dashboard" : "home");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [userId]);

  // Fetch user's strain entries
  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const requestUrl = `${STRAIN_API_URL}?user_id=${encodeURIComponent(userId)}&t=${Date.now()}`;
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
  }, [userId, refreshEntries, fetchEntries]);

  const handleEntryLogged = () => {
    setRefreshEntries((prev) => !prev);
  };

  const handleCommentSubmitted = () => {
    setRefreshComments((prev) => !prev);
  };

  const previousStrains = [...new Set(entries.map((entry) => entry.strain_name))];

  // Render the main content based on the current view
  const renderContent = () => {
    if (view === "home") {
      return (
        <div className="landing">
          <h1>Join Club Redstone</h1>
          <p>
            1. No backlogging. If you forget to log a smoke session, move on and get better.
            2. Rank up.
          </p>
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
    } else if (view === "admin") {
      return <AdminDashboard />;
    } else if (view === "comms") {
      return (
        <div className="comms-page">
          <h1>Comms Page</h1>
          <p>Welcome to the communications page. More features coming soon!</p>
        </div>
      );
    } else if (view === "merch") {
      return (
        <div className="merch-page">
          <h1>Merch</h1>
          <p>Coming Soon</p>
        </div>
      );
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
            <XPProgressBar userId={userId} triggerUpdate={refreshEntries} />
          </div>
          <div className="badges-box">
            <h3>Badges</h3>
            <TrailblazerBadge isTrailblazer={isTrailblazer} />
          </div>
          {/* NEW: Date Entry Form and User Comments Section */}
          <DateEntryForm userId={userId} onCommentSubmitted={handleCommentSubmitted} />
          <UserComments userId={userId} refresh={refreshComments} />
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
