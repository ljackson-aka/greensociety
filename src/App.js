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
import "./App.css";

import demo1 from "./demo1.jpg";
import demo2 from "./demo2.jpg";
import demo3 from "./demo3.jpg";
import AR6 from "./AR6.png";
// TMHCRC import removed per request

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

  // HTML for the two Stripe buttons
  const [hoodieHTML, setHoodieHTML] = useState("");
  const [donateHTML, setDonateHTML] = useState("");

  // Load Stripe script and prepare both button HTML blocks
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
      setDonateHTML(`
        <stripe-buy-button
          buy-button-id="buy_btn_1ROp2SJrLBeT2yh0WBkuBBgL"
          publishable-key="pk_live_51LNfK8JrLBeT2yh0M9LkMQzvHpAWiU3sdjmRRm9nWH4nVJ3x8FIglwwOnPgfuoc2F4ZWBZulOJl5FiBillt4cTWG00Te1NEnt2">
        </stripe-buy-button>
      `);
    };
    document.head.appendChild(script);
  }, []);

  // Restore your original updateUserState that sets userId, userSub, level
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
    } catch {
      setUserId(null);
      setUserSub(null);
      setLevel(null);
      return null;
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
      } else if (hash === "#leaderboard") {
        setView("leaderboard");
      } else if (hash === "#signin") {
        setView("signin");
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

  // Mobile quick‑link handlers to trigger the actual stripe-buy-buttons
  const handleMobilePurchase = () => {
    const btn = document.querySelector(
      'stripe-buy-button[buy-button-id="buy_btn_1RSb9oJrLBeT2yh0f4hgKoHj"]'
    );
    if (btn) btn.click();
  };
  const handleMobileSupport = () => {
    const btn = document.querySelector(
      'stripe-buy-button[buy-button-id="buy_btn_1ROp2SJrLBeT2yh0WBkuBBgL"]'
    );
    if (btn) btn.click();
  };

  const renderContent = () => {
    switch (view) {
      case "home":
        return (
          <div className="landing">
            <h1 className="landing-title">Join Club Redstone</h1>

            <div className="hero-section">
              <img
                src={AR6}
                alt="Aquarius Rising Promo"
                className="home-hero-image"
              />
              <div className="hero-description">
                <p>
                  Aquarius Rising is an upcoming third-person survival shooter
                  for PC.
                </p>
                <h2>The Farm</h2>
                <p>Collect. Germinate. Grow. Harvest.</p>
                <p>
                  Acquire rare seeds from drops or purchase them directly from
                  the in‑game or web‑based auction house.
                </p>
                <p>
                  Sell to the government for safety or the black market for risk
                  and reward.
                </p>
                <h2>Retribution (PvE)</h2>
                <p>
                  Growers with high rep must defend against government raids.
                  Defend your farm.
                </p>
                <h2>Payback (PvP)</h2>
                <p>Your black market deals hurt others. Pay it back in blood.</p>
                <p>
                  <strong>
                    Aquarius Rising will be available to all subscribers of
                    Club Redstone.
                  </strong>
                </p>
              </div>
            </div>

            <hr />
            <h2 style={{ textAlign: "center" }}>
              Track your smoking sessions. Demo: Log a Session
            </h2>
            <StrainFormSwitcher
              onEntryLogged={() => setDemoXPTrigger((t) => t + 1)}
              previousStrains={[
                "Blue Dream",
                "OG Kush",
                "Girl Scout Cookies",
              ]}
            />
            <XPProgressBar demo triggerUpdate={demoXPTrigger} />
            <div className="screenshots">
              {[demo1, demo2, demo3].map((img, i) => (
                <div className="screenshot-item" key={i}>
                  <p className="caption">
                    {`${i + 1}. ${
                      ["Add a Session", "Track stats and tendencies", "See history"][i]
                    }`}
                  </p>
                  <img src={img} alt={`Demo ${i + 1}`} />
                </div>
              ))}
            </div>
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
                previousStrains={[
                  ...new Set(entries.map((e) => e.strain_name)),
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

      {/* Fixed right‐side panel with the two Stripe buttons */}
      <div className="stripe-fixed-panel">
        <div dangerouslySetInnerHTML={{ __html: hoodieHTML }} />
        <div dangerouslySetInnerHTML={{ __html: donateHTML }} />
      </div>

      {/* MOBILE ONLY: simple bottom buttons */}
      <div className="mobile-quick-links">
        <button onClick={handleMobilePurchase}>Purchase Hoodie</button>
        <button onClick={handleMobileSupport}>
          Support Club Redstone
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default App;
