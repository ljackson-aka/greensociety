import React, { useState } from "react";
import "./UserEntries.css";

const UserEntries = ({ entries }) => {
  // Use state to track how many entries are visible.
  const [visibleCount, setVisibleCount] = useState(10);

  if (!entries || entries.length === 0) {
    return (
      <div className="user-entries">
        <h2>What I'm Smoking:</h2>
        <p>No entries found. Log a strain to see your history!</p>
      </div>
    );
  }

  // Format timestamp for better readability.
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown Date";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Sort entries by timestamp (latest first), filtering out invalid dates.
  const sortedEntries = [...entries]
    .filter(
      (entry) =>
        entry.timestamp && !isNaN(new Date(entry.timestamp).getTime())
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Only show the first "visibleCount" entries (newest first).
  const visibleEntries = sortedEntries.slice(0, visibleCount);

  return (
    <div className="user-entries">
      <h2>What I'm Smoking:</h2>
      <div className="entries-container">
        <div className="entries-header">
          <span>Strain</span>
          <span>Type</span>
          <span>Method</span>
          <span>Date</span>
        </div>
        {visibleEntries.map((entry) => (
          <div
            key={entry.entry_id || `${entry.strain_name}-${entry.timestamp}`}
            className="entry-row"
          >
            <span className="entry-name">{entry.strain_name}</span>
            <span className="entry-type">{entry.strain_type}</span>
            <span className="entry-method">{entry.method}</span>
            <span className="entry-timestamp">
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        ))}
      </div>
      {/* Show "Load More" button if there are more entries */}
      {visibleCount < sortedEntries.length && (
        <button
          className="load-more-button"
          onClick={() => setVisibleCount(visibleCount + 10)}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default UserEntries;
