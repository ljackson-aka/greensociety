import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Auth } from "aws-amplify";

const Navbar = ({ userId }) => {
  const [displayName, setDisplayName] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setDisplayName(user.attributes?.preferred_username || user.attributes?.email);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      window.location.reload(); // Refresh page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Club Redstone</div>
      <ul className="navbar-links">
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
        ) : null}
      </ul>
    </nav>
  );
};

export default Navbar;
