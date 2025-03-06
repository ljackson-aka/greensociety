import React, { useState, useEffect, useCallback } from "react";
import { Hub, Auth } from "aws-amplify";
import Navbar from "./Navbar";
import StrainForm from "./StrainForm";
import UserEntries from "./UserEntries";
import StrainStats from "./StrainStats";
import XPProgressBar from "./XPProgressBar";
import TrailblazerBadge from "./TrailblazerBadge";
import Leaderboard from "./Leaderboard";
import AdminDashboard from "./AdminDashboard";
import DateEntryForm from "./DateEntryForm";
import UserComments from "./UserComments";
import AuthContainer from "./AuthContainer";
import Comms from "./Comms";
import Achievements from "./Achievements";
import "./App.css";

const STRAIN_API_URL =
  "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

const App = () => {
  // Dashboard (private) uses email...
  const [userId, setUserId] = useState(null);
  // Achievements (public) uses the Cognito sub.
  const [userSub, setUserSub] = useState(null);
  const [level, setLevel] = useState(null);
  const [isTrailblazer, setIsTrailblazer] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshEntries, setRefreshEntries] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  // view controls which page to show
  const [view, setView] = useState("home");
  // sharedUserId holds the UID from the URL or updated state when viewing achievements.
  const [sharedUserId, setSharedUserId] = useState(null);

  // updateUserState now returns new state values.
  const updateUserState = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const newUserId = user.attributes.email;
      const newUserSub = user.attributes.sub;
      const newLevel = user.attributes["custom:level"] || user.attributes["level"];
      setUserId(newUserId);
      setUserSub(newUserSub);
      setIsTrailblazer(user.attributes["custom:isTrailblazer"] === "true");
      setLevel(newLevel);
      return { userId: newUserId, userSub: newUserSub, level: newLevel };
    } catch (error) {
      setUserId(null);
      setUserSub(null);
      setLevel(null);
      return null;
    }
  };

  // On mount, check auth.
  useEffect(() => {
    (async () => {
      const authenticated = await updateUserState();
      setView(authenticated ? "dashboard" : "home");
    })();
  }, []);

  // Listen for auth events.
  useEffect(() => {
    const listener = (data) => {
      const { payload } = data;
      if (payload.event === "signIn" || payload.event === "signUp") {
        updateUserState().then((newState) => {
          if (newState) setView("dashboard");
        });
      }
      if (payload.event === "signOut") {
        setUserId(null);
        setUserSub(null);
        setLevel(null);
        setView("home");
      }
    };
    Hub.listen("auth", listener);
    return () => Hub.remove("auth", listener);
  }, []);

  // Hash change handler: when hash changes, update view.
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#achievements")) {
        // Re-fetch user state immediately when entering achievements.
        updateUserState().then((newState) => {
          if (newState && newState.userSub) {
            const newHash = `#achievements?uid=${encodeURIComponent(newState.userSub)}`;
            window.history.replaceState(null, "", newHash);
            setSharedUserId(newState.userSub);
          }
          setView("achievements");
        });
      } else if (hash === "#leaderboard") {
        setView("leaderboard");
      } else if (hash === "#profile") {
        setView("dashboard");
      } else if (hash === "#signin") {
        setView(userId ? "dashboard" : "signin");
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
    // Trigger on mount.
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [userId]);

  // fetchEntries uses email for dashboard; UID (sharedUserId or userSub) for achievements.
  const fetchEntries = useCallback(async () => {
    let uidToUse;
    if (view === "dashboard") {
      uidToUse = userId;
    } else if (view === "achievements") {
      uidToUse = sharedUserId || userSub;
    }
    if (!uidToUse) return;
    setLoading(true);
    try {
      // Build the URL with only the user_id parameter.
      const requestUrl = `${STRAIN_API_URL}?user_id=${encodeURIComponent(uidToUse)}`;
      console.log("Fetching entries from:", requestUrl); // Debug log.
      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
  }, [view, userId, sharedUserId, userSub]);

  useEffect(() => {
    if (
      (view === "dashboard" && userId) ||
      (view === "achievements" && (sharedUserId || userSub))
    ) {
      fetchEntries();
    }
  }, [view, userId, sharedUserId, userSub, refreshEntries, fetchEntries]);

  const handleEntryLogged = () => setRefreshEntries((prev) => !prev);
  const handleCommentSubmitted = () => setRefreshComments((prev) => !prev);
  const previousStrains = [...new Set(entries.map((entry) => entry.strain_name))];

  const renderContent = () => {
    switch (view) {
      case "home":
        return (
          <div className="landing">
            <h1>Join Club Redstone</h1>
            <p>No backlogging. If you forget to log a smoke session, move on and get better.</p>
            <p>Rank up.</p>
            <p>Please sign in or sign up to play.</p>
          </div>
        );
      case "signin":
        return (
          <AuthContainer
            onAuthSuccess={async () => {
              await updateUserState();
              setView("dashboard");
            }}
          />
        );
      case "leaderboard":
        return <Leaderboard />;
      case "admin":
        return <AdminDashboard />;
      case "comms":
        return <Comms />;
      case "merch":
        return (
          <div className="merch-page">
            <h1>Merch</h1>
            <p>Coming Soon</p>
          </div>
        );
      case "achievements":
        return (
          <Achievements
            entries={entries}
            level={level}
            userId={sharedUserId || userSub}
          />
        );
      case "dashboard":
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
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Navbar userId={userId} />
      {renderContent()}
    </div>
  );
};

export default App;
