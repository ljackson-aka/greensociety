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
    // Convert timestamp string to a number.
    let tsNum = Number(timestamp);
    // If the timestamp has 10 digits, assume it's in seconds, so convert to milliseconds.
    if (timestamp.length === 10) {
      tsNum *= 1000;
    }
    const date = new Date(tsNum);
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

  // Sort entries by timestamp (latest first), converting timestamps to numbers.
  const sortedEntries = [...entries]
    .filter(
      (entry) =>
        entry.timestamp &&
        !isNaN(new Date(
          entry.timestamp.length === 10 ? Number(entry.timestamp) * 1000 : Number(entry.timestamp)
        ).getTime())
    )
    .sort((a, b) => {
      const aTime = a.timestamp.length === 10 ? Number(a.timestamp) * 1000 : Number(a.timestamp);
      const bTime = b.timestamp.length === 10 ? Number(b.timestamp) * 1000 : Number(b.timestamp);
      return bTime - aTime;
    });

  // Only show the first "visibleCount" entries.
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
