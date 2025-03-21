import React, { useState, useEffect, useCallback } from "react";
import { Hub, Auth } from "aws-amplify";
import Navbar from "./Navbar";
import StrainFormSwitcher from "./StrainFormSwitcher";
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
import Speak from "./Speak"; // New Speak page
import "./App.css";

// Import demo images from the src folder.
import demo1 from "./demo1.jpg";
import demo2 from "./demo2.jpg";
import demo3 from "./demo3.jpg";

// Import the merch image
import merchImage from "./merch.png";

const STRAIN_API_URL =
  "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [userSub, setUserSub] = useState(null);
  const [level, setLevel] = useState(null);
  const [isTrailblazer, setIsTrailblazer] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshEntries, setRefreshEntries] = useState(false);
  const [view, setView] = useState("home");
  const [sharedUserId, setSharedUserId] = useState(null);
  const [demoXPTrigger, setDemoXPTrigger] = useState(0);

  const updateUserState = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const newUserId = user.attributes.email;
      const newUserSub = user.attributes.sub;
      const newLevel =
        user.attributes["custom:level"] || user.attributes["level"];
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

  useEffect(() => {
    (async () => {
      const authenticated = await updateUserState();
      setView(authenticated ? "dashboard" : "home");
    })();
  }, []);

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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#achievements")) {
        updateUserState().then((newState) => {
          if (newState && newState.userSub) {
            const newHash = `#achievements?uid=${encodeURIComponent(
              newState.userSub
            )}`;
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
      } else if (hash === "#speak") {
        setView("speak");
      } else {
        setView(userId ? "dashboard" : "home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () =>
      window.removeEventListener("hashchange", handleHashChange);
  }, [userId]);

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
      const requestUrl = `${STRAIN_API_URL}?user_id=${encodeURIComponent(
        uidToUse
      )}`;
      const response = await fetch(requestUrl);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
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

  const renderContent = () => {
    switch (view) {
      case "home":
        return (
          <div className="landing" style={{ textAlign: "center" }}>
            <h1>Join Club Redstone</h1>
            <p>
              Track your cannabis smoking sessions. Earn rank, badges, and
              rewards.
            </p>
            <p>Rank up.</p>
            <p>Please sign in or sign up to play.</p>
            <hr />
            <h2 style={{ textAlign: "center" }}>Demo: Log a Session</h2>
            <StrainFormSwitcher
              onEntryLogged={() => setDemoXPTrigger((prev) => prev + 1)}
              previousStrains={[
                "Blue Dream",
                "OG Kush",
                "Girl Scout Cookies",
              ]}
            />
            <XPProgressBar demo={true} triggerUpdate={demoXPTrigger} />
            <div className="screenshots">
              <div className="screenshot-item">
                <p className="caption">1. Add a Session.</p>
                <img src={demo1} alt="Demo Screenshot 1" />
              </div>
              <div className="screenshot-item">
                <p className="caption">2. Track stats and tendencies.</p>
                <img src={demo2} alt="Demo Screenshot 2" />
              </div>
              <div className="screenshot-item">
                <p className="caption">3. See history.</p>
                <img src={demo3} alt="Demo Screenshot 3" />
              </div>
            </div>
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
            <div className="merch-image-container">
              <img src={merchImage} alt="Merch" className="merch-image" />
            </div>
            <div className="merch-text">
              <h1>Coming Soon</h1>
            </div>
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
              <StrainFormSwitcher
                userId={userId}
                onEntryLogged={handleEntryLogged}
                previousStrains={[
                  ...new Set(entries.map((entry) => entry.strain_name)),
                ]}
              />
            </div>
            <div className="xp-container">
              <XPProgressBar userId={userId} triggerUpdate={refreshEntries} />
            </div>
            <div className="badges-box">
              <h3>Badges</h3>
              <TrailblazerBadge isTrailblazer={isTrailblazer} />
            </div>
            <DateEntryForm
              userId={userId}
              onCommentSubmitted={handleEntryLogged}
            />
            <UserComments userId={userId} refresh={refreshEntries} />
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
      case "speak":
        return <Speak />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Navbar userId={userId} userSub={userSub} />
      {renderContent()}
    </div>
  );
};

export default App;
