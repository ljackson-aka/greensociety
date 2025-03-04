import React, { useState, useEffect, useRef } from "react";
import { updateUserXP } from "./xpService";

const XPProgressBar = ({ userId, triggerUpdate }) => {
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressWidth, setProgressWidth] = useState("0%");
  // States for the ticker animation of XP numbers.
  const [displayXP, setDisplayXP] = useState(0);
  const [displayNextLevelXP, setDisplayNextLevelXP] = useState(0);
  const animationDuration = 1000; // ms

  // States for level animations.
  const [animateLevel, setAnimateLevel] = useState(false);
  const [rankedUp, setRankedUp] = useState(false);

  // Refs to store previous values.
  const prevXPRef = useRef(0);
  const prevNextLevelXPRef = useRef(0);
  const prevLevelRef = useRef(0);

  // Fetch XP data when userId or triggerUpdate changes.
  useEffect(() => {
    async function fetchXP() {
      try {
        setLoading(true);
        const data = await updateUserXP(userId);
        console.log("XP data fetched:", data);
        setXpData(data);
      } catch (error) {
        console.error("Failed to fetch XP data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      fetchXP();
    }
  }, [userId, triggerUpdate]);

  // When xpData updates, animate the progress bar and numbers.
  useEffect(() => {
    if (xpData) {
      const totalXP = parseFloat(xpData.total_xp);
      const newLevel = xpData.level; // level is a number
      const nextLevelXP = parseFloat(xpData.next_level_xp);
      
      // Calculate the previous level threshold.
      // For level 1, previous threshold is 0.
      const prevLevelThreshold =
        newLevel > 1 ? ((newLevel - 1) ** 2) * 100 : 0; // using XP_FACTOR = 100
      
      // Compute progress within the current level.
      const progressWithinLevel =
        ((totalXP - prevLevelThreshold) / (nextLevelXP - prevLevelThreshold)) * 100;
      
      // Check if the level has increased.
      if (newLevel > prevLevelRef.current) {
        // New level: show "Ranked up!" and reset the progress bar to 0%.
        setRankedUp(true);
        setProgressWidth("0%");
        // Delay a short moment to ensure the reset renders.
        setTimeout(() => {
          setProgressWidth(`${Math.min(progressWithinLevel, 100)}%`);
        }, 50);
        // Hide the "Ranked up!" message after 2 seconds.
        setTimeout(() => setRankedUp(false), 2000);
      } else {
        // Otherwise, animate to the current progress.
        setProgressWidth(`${Math.min(progressWithinLevel, 100)}%`);
      }
      
      // Animate the XP numbers with a ticker effect.
      const startXP = prevXPRef.current;
      const endXP = totalXP;
      const startNextLevelXP = prevNextLevelXPRef.current;
      const endNextLevelXP = nextLevelXP;
      const startTime = performance.now();
      
      const animateNumbers = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const currentXP = startXP + (endXP - startXP) * progress;
        const currentNextLevelXP = startNextLevelXP + (endNextLevelXP - startNextLevelXP) * progress;
        setDisplayXP(currentXP);
        setDisplayNextLevelXP(currentNextLevelXP);
        if (progress < 1) {
          requestAnimationFrame(animateNumbers);
        } else {
          setDisplayXP(endXP);
          setDisplayNextLevelXP(endNextLevelXP);
          prevXPRef.current = endXP;
          prevNextLevelXPRef.current = endNextLevelXP;
        }
      };
      requestAnimationFrame(animateNumbers);
      
      // Trigger a glow animation on the level number.
      setAnimateLevel(true);
      setTimeout(() => setAnimateLevel(false), animationDuration);
      // Update the previous level ref.
      prevLevelRef.current = newLevel;
    }
  }, [xpData]);

  if (loading) {
    return (
      <div style={{ marginTop: "20px" }}>
        <p>Loading XP data...</p>
      </div>
    );
  }

  if (!xpData) {
    return (
      <div style={{ marginTop: "20px" }}>
        <p>Unable to load XP data.</p>
      </div>
    );
  }

  const level = xpData.level;
  const totalXP = parseFloat(xpData.total_xp);
  const nextLevelXP = parseFloat(xpData.next_level_xp);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 className={animateLevel ? "level-update" : ""}>
        Level: {level} {rankedUp && <span className="ranked-up">Ranked up!</span>}
      </h3>
      <div
        style={{
          backgroundColor: "#ddd",
          width: "100%",
          height: "20px",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#4caf50",
            width: progressWidth,
            height: "100%",
            transition: "width 1s ease",
          }}
        ></div>
      </div>
      <p>
        {displayXP.toFixed(2)} XP / {displayNextLevelXP.toFixed(2)} XP needed for next level
      </p>
    </div>
  );
};

export default XPProgressBar;
