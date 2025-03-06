// Achievements.js
import React, { useEffect } from "react";
import TrailblazerBadge from "./TrailblazerBadge";
import "./Achievements.css";

const Achievements = ({ entries, level, userId }) => {
  // Debug logging.
  useEffect(() => {
    console.log("Achievements level prop:", level);
  }, [level]);

  useEffect(() => {
    console.log("Achievements entries:", entries);
  }, [entries]);

  // Get the most recent session entry (assumes entries are in chronological order).
  const recentEntry = entries && entries.length ? entries[entries.length - 1] : null;

  // Calculate most used method and strain type.
  const methodCounts = {};
  const strainTypeCounts = {};
  entries.forEach((entry) => {
    if (entry.method) {
      methodCounts[entry.method] = (methodCounts[entry.method] || 0) + 1;
    }
    if (entry.strain_type) {
      strainTypeCounts[entry.strain_type] = (strainTypeCounts[entry.strain_type] || 0) + 1;
    }
  });
  const mostUsedMethod = Object.keys(methodCounts).reduce(
    (a, b) => (methodCounts[a] > methodCounts[b] ? a : b),
    ""
  );
  const mostUsedStrainType = Object.keys(strainTypeCounts).reduce(
    (a, b) => (strainTypeCounts[a] > strainTypeCounts[b] ? a : b),
    ""
  );

  return (
    <div className="achievements-container">
      <h1>Your Achievements</h1>

      {recentEntry ? (
        <div className="recent-session">
          <h2>Most Recent Session</h2>
          <div className="session-details">
            <p>
              <strong>Strain:</strong> {recentEntry.strain_name}
            </p>
            <p>
              <strong>Method:</strong> {recentEntry.method}
            </p>
          </div>
        </div>
      ) : (
        <p>No session data available.</p>
      )}

      <div className="badges">
        <h2>Your Badges</h2>
        <TrailblazerBadge isTrailblazer={true} />
      </div>

      <div className="stats">
        <h2>Personal Stats</h2>
        <p>
          <strong>Most Used Method:</strong> {mostUsedMethod || "N/A"}
        </p>
        <p>
          <strong>Most Used Strain Type:</strong> {mostUsedStrainType || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Achievements;
