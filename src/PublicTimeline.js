// src/PublicTimeline.js
import React, { useEffect, useState, useCallback } from "react";
import "./PublicTimeline.css";

const DEFAULT_LIMIT = 20;
const AUTO_REFRESH_MS = 15000; // refresh every 15 seconds

/**
 * Convert a millisecond timestamp into
 * "x minutes ago", "x hours ago", or "x days ago"
 */
function timeAgo(timestamp) {
  const now = Date.now();
  const diffMs = now - Number(timestamp);

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

/** True if entry is less than 1 minute old */
function isLive(timestamp) {
  return Date.now() - Number(timestamp) < 60 * 1000;
}

/** Returns a CSS class based on entry age */
function ageClass(timestamp) {
  const diffMs = Date.now() - Number(timestamp);

  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  if (diffMs < oneHour) return "age-fresh";
  if (diffMs < oneDay) return "age-day";
  return "age-old";
}

const PublicTimeline = ({ apiUrl }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState(null);

  // Tracks which entries we've already rendered
  const [seenIds, setSeenIds] = useState(new Set());

  // Forces re-render every second so LIVE + timeAgo update naturally
  const [, setNowTick] = useState(Date.now());

  /** Initial + paginated fetch */
  const fetchTimeline = useCallback(async () => {
    if (!apiUrl || loading) return;

    setLoading(true);
    setError(null);

    try {
      const url = cursor
        ? `${apiUrl}?limit=${DEFAULT_LIMIT}&cursor=${encodeURIComponent(cursor)}`
        : `${apiUrl}?limit=${DEFAULT_LIMIT}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const newItems = data.items || [];

      setItems((prev) => [...prev, ...newItems]);

      setSeenIds((prev) => {
        const next = new Set(prev);
        newItems.forEach((i) => next.add(i.entry_id));
        return next;
      });

      setCursor(data.nextCursor || null);
    } catch (err) {
      console.error("Timeline fetch error:", err);
      setError("Failed to load timeline");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, cursor, loading]);

  /** Auto-refresh newest items (prepend only unseen ones) */
  const refreshLatest = useCallback(async () => {
    if (!apiUrl) return;

    try {
      const res = await fetch(`${apiUrl}?limit=${DEFAULT_LIMIT}`);
      if (!res.ok) return;

      const data = await res.json();
      const latest = data.items || [];

      const newOnes = latest.filter(
        (item) => !seenIds.has(item.entry_id)
      );

      if (newOnes.length > 0) {
        newOnes.sort(
          (a, b) => Number(b.timestamp) - Number(a.timestamp)
        );

        setItems((prev) => [...newOnes, ...prev]);

        setSeenIds((prev) => {
          const next = new Set(prev);
          newOnes.forEach((i) => next.add(i.entry_id));
          return next;
        });
      }
    } catch (err) {
      console.error("Auto-refresh failed:", err);
    }
  }, [apiUrl, seenIds]);

  /** Initial load */
  useEffect(() => {
    fetchTimeline();
  }, []); // intentional: run once

  /** Auto-refresh interval */
  useEffect(() => {
    if (!apiUrl) return;

    const id = setInterval(refreshLatest, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [apiUrl, refreshLatest]);

  /** Tick every second for LIVE + timeAgo updates */
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="public-timeline">
      <h2 className="timeline-title"></h2>

      {items.map((item) => (
        <div
          key={item.entry_id}
          className={`timeline-item ${ageClass(item.timestamp)}`}
        >
          <div className="timeline-text">
            <strong>{item.preferred_username}</strong>{" "}
            smoked a <strong>{item.method}</strong> of{" "}
            <strong>{item.strain_name}</strong>
            {isLive(item.timestamp) && (
              <span className="live-badge">LIVE</span>
            )}
          </div>

          <div className="timeline-time">
            {timeAgo(item.timestamp)}
          </div>
        </div>
      ))}

      {error && <p className="timeline-error">{error}</p>}

      {cursor && (
        <button
          className="timeline-load-more"
          onClick={fetchTimeline}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}

      {!cursor && !loading && items.length > 0 && (
        <p className="timeline-end">No more entries</p>
      )}
    </div>
  );
};

export default PublicTimeline;
