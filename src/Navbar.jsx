import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { Auth } from "aws-amplify";
import logo from "./logo1.PNG";

const Navbar = ({ userId, userSub }) => {
  const [displayName, setDisplayName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const name = user.attributes?.preferred_username || user.attributes?.email;
        setDisplayName(name);
        const groups = user.signInUserSession.accessToken.payload["cognito:groups"] || [];
        setIsAdmin(groups.includes("Admin"));
      } catch (error) {
        setDisplayName(null);
        setIsAdmin(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      window.location.hash = "#home";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    window.location.hash = "#signin";
  };

  // Construct share URL using unique userSub.
  const shareAchievementsUrl = userSub ? `#achievements?uid=${encodeURIComponent(userSub)}` : "#achievements";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="Club Redstone" className="logo" />
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <a href="#home">Home</a>
        </li>
        <li>
          <a href="#comms">Comms</a>
        </li>
        <li>
          <a href="#leaderboard">Leaderboard</a>
        </li>
        {isAdmin && (
          <li>
            <a href="#admin">Admin</a>
          </li>
        )}
        {displayName ? (
          <>
            <li>
              <a href="#profile" className="profile-link">
                Profile ({displayName})
              </a>
            </li>
            <li>
              <a href={shareAchievementsUrl}>Share Achievements</a>
            </li>
            <li>
              <a href="#merch">Merch</a>
            </li>
            <li>
              <button className="signout-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <button className="signout-btn" onClick={handleSignIn}>
              Sign In
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
