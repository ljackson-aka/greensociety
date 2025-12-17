// src/App.js
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
import AuthContainer from "./AuthContainer";
import Comms from "./Comms";
import Achievements from "./Achievements";
import Speak from "./Speak";
import Merch from "./Merch";
import PublicTimeline from "./PublicTimeline";
import "./App.css";

const STRAIN_API_URL =
  "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

// Will be set once Lambda + Dynamo is ready
const PUBLIC_TIMELINE_API_URL = "https://ke44zkaoki.execute-api.us-east-2.amazonaws.com/prod/public-timeline";

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
  const [hoodieHTML, setHoodieHTML] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    script.onload = () => {
      setHoodieHTML(`
        <stripe-buy-button
          buy-button-id="buy_btn_1RSb9oJrLBeT2yh0f4hgKoHj"
          publishable-key="pk_live_51LNfK8JrLBeT2yh0M9LkMQzvHpAWiU3sdjmRRm9nWH4nVJ3x8FIglwwOnPgfuoc2F4ZWBZulOJl5FiBillt4cTWG00Te1NEnt2">
        </stripe-buy-button>
      `);
    };
    document.head.appendChild(script);
  }, []);

  const updateUserState = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUserId(user.attributes.email);
      setUserSub(user.attributes.sub);
      setIsTrailblazer(user.attributes["custom:isTrailblazer"] === "true");
      setLevel(user.attributes["custom:level"] || user.attributes.level);
      return true;
    } catch {
      setUserId(null);
      setUserSub(null);
      setIsTrailblazer(false);
      setLevel(null);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const auth = await updateUserState();
      setView(auth ? "dashboard" : "home");
    })();
  }, []);

  useEffect(() => {
    const listener = ({ payload }) => {
      if (payload.event === "signIn" || payload.event === "signUp") {
        updateUserState().then((ok) => ok && setView("dashboard"));
      }
      if (payload.event === "signOut") {
        setUserId(null);
        setUserSub(null);
        setIsTrailblazer(false);
        setLevel(null);
        setView("home");
      }
    };
    Hub.listen("auth", listener);
    return () => Hub.remove("auth", listener);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#achievements")) {
        const [, query] = hash.split("?");
        if (query) {
          const params = new URLSearchParams(query);
          const uid = params.get("uid");
          if (uid) setSharedUserId(uid);
        }
        setView("achievements");
      } else if (hash === "#leaderboard") setView("leaderboard");
      else if (hash === "#signin") setView("signin");
      else if (hash === "#admin") setView("admin");
      else if (hash === "#comms") setView("comms");
      else if (hash === "#merch") setView("merch");
      else if (hash === "#speak") setView("speak");
      else setView(userId ? "dashboard" : "home");
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, [userId]);

  const fetchEntries = useCallback(async () => {
    const uid =
      view === "dashboard"
        ? userId
        : view === "achievements"
        ? sharedUserId || userSub
        : null;

    if (!uid) return;

    setLoading(true);
    try {
      const res = await fetch(`${STRAIN_API_URL}?user_id=${encodeURIComponent(uid)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data = await res.json();
      if (typeof data.body === "string") data = JSON.parse(data.body);
      setEntries(data.data || []);
      setError("");
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

  const handleEntryLogged = () => setRefreshEntries((p) => !p);

  const renderContent = () => {
    switch (view) {
      case "home":
        return (
          <div className="landing">
            <h1 className="landing-title">Join Club Redstone</h1>
            <PublicTimeline apiUrl={PUBLIC_TIMELINE_API_URL || null} />
          </div>
        );

      case "signin":
        return (
          <AuthContainer
            onAuthSuccess={async () => {
              await updateUserState();
              window.location.hash = "#profile";
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
        return <Merch />;

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
                previousStrains={[...new Set(entries.map((e) => e.strain_name))]}
              />
            </div>

            <div className="xp-container">
              <XPProgressBar userId={userId} triggerUpdate={refreshEntries} />
            </div>

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

      <div className="stripe-fixed-panel">
        <div dangerouslySetInnerHTML={{ __html: hoodieHTML }} />
      </div>

      <div className="mobile-quick-links">
        <a
          href="https://buy.stripe.com/9B6cN6cZ23Ku5CvgPD0oM06"
          className="mobile-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Purchase Hoodie
        </a>
      </div>

      {renderContent()}
    </div>
  );
};

export default App;
