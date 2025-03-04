import React, { useState, useEffect, useRef } from "react";
import { updateUserXP } from "./xpService";

const XPProgressBar = ({ userId, triggerUpdate }) => {
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);
  // This state controls the CSS width of the progress bar.
  const [progressWidth, setProgressWidth] = useState("0%");
  // States for animating the displayed XP numbers.
  const [displayXP, setDisplayXP] = useState(0);
  const [displayNextLevelXP, setDisplayNextLevelXP] = useState(0);
  const animationDuration = 1000;

  // Visual effects for level glow and ranked-up message.
  const [animateLevel, setAnimateLevel] = useState(false);
  const [rankedUp, setRankedUp] = useState(false);

  // Refs to store previous XP (relative to level) and level.
  const prevRelativeXPRef = useRef(0);
  const prevLevelRef = useRef(0);

  // Fetch XP data from API.
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

  useEffect(() => {
    if (xpData) {
      // Assume the API returns cumulative XP values.
      // Calculate the XP threshold for the previous level.
      const newLevel = xpData.level;
      const cumulativeXP = parseFloat(xpData.total_xp);
      const nextLevelCumulative = parseFloat(xpData.next_level_xp);
      // For a cumulative system, calculate the previous level threshold.
      // (This formula is an example; adjust it to your leveling system.)
      const prevLevelThreshold = newLevel > 1 ? ((newLevel - 1) ** 2) * 100 : 0;
      // Calculate the relative XP for the current level.
      const relativeXP = cumulativeXP - prevLevelThreshold;
      const levelRequirement = nextLevelCumulative - prevLevelThreshold;
      // Compute progress as a percentage of the level.
      const progressPercentage = (relativeXP / levelRequirement) * 100;

      // Determine if a level-up occurred.
      const isLevelUp = newLevel > prevLevelRef.current;

      if (isLevelUp) {
        // When a level-up happens, treat the new level's bar as starting at 0.
        setRankedUp(true);
        // Force the bar to 0% (for the new level, relative XP resets).
        setProgressWidth("0%");
        // Reset the number animation start value.
        prevRelativeXPRef.current = 0;
        // Force reflow and animate to the new progress.
        setTimeout(() => {
          requestAnimationFrame(() => {
            setProgressWidth(`${Math.min(progressPercentage, 100)}%`);
          });
        }, 100);
        setTimeout(() => setRankedUp(false), 2000);
      } else {
        // If no level-up, animate smoothly from previous relative XP.
        requestAnimationFrame(() => {
          setProgressWidth(`${Math.min(progressPercentage, 100)}%`);
        });
      }

      // Animate the displayed XP numbers from the previous relative XP to the current.
      const startXP = prevRelativeXPRef.current;
      const endXP = relativeXP;
      const startTime = performance.now();
      const animateNumbers = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        setDisplayXP(startXP + (endXP - startXP) * progress);
        setDisplayNextLevelXP(levelRequirement);
        if (progress < 1) {
          requestAnimationFrame(animateNumbers);
        } else {
          setDisplayXP(endXP);
          prevRelativeXPRef.current = endXP;
        }
      };
      requestAnimationFrame(animateNumbers);

      // Trigger level glow.
      setAnimateLevel(true);
      setTimeout(() => setAnimateLevel(false), animationDuration);
      // Update the stored level.
      prevLevelRef.current = newLevel;
    }
  }, [xpData]);

  if (loading) {
    return <p>Loading XP data...</p>;
  }
  if (!xpData) {
    return <p>Unable to load XP data.</p>;
  }

  return (
    <div className="xp-container">
      <h3 className={animateLevel ? "level-glow" : ""}>
        Level: {xpData.level} {rankedUp && <span className="ranked-up">Ranked up!</span>}
      </h3>
      <div className="xp-bar">
        <div className="xp-progress" style={{ width: progressWidth }}></div>
      </div>
      <p>
        {displayXP.toFixed(2)} XP / {displayNextLevelXP.toFixed(2)} XP needed for next level
      </p>
    </div>
  );
};

export default XPProgressBar;
