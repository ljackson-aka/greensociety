// Navbar.js
import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Auth } from "aws-amplify";

const Navbar = () => {
  const [displayName, setDisplayName] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setDisplayName(user.attributes?.preferred_username || user.attributes?.email);
      } catch (error) {
        // No user logged in
        setDisplayName(null);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      window.location.hash = "#home"; // redirect to home after sign out
      window.location.reload(); // force a full reload to clear user state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    window.location.hash = "#signin"; // go to sign in view
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Club Redstone</div>
      <ul className="navbar-links">
        {/* Home link is always accessible */}
        <li>
          <a href="#home">Home</a>
        </li>
        <li>
          <a href="#leaderboard">Leaderboard</a>
        </li>
        {displayName ? (
          <>
            <li>
              <a href="#profile" className="profile-link">
                Profile ({displayName})
              </a>
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
