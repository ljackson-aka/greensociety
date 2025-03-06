import React, { useState, useEffect, useRef } from "react";
import { updateUserXP } from "./xpService";

const XPProgressBar = ({ userId, triggerUpdate, demo }) => {
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Controls the CSS width of the progress bar.
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

  // For demo mode, set initial dummy XP data on mount.
  useEffect(() => {
    if (demo && !xpData) {
      setXpData({ level: 1, total_xp: 0, next_level_xp: 100 });
      setLoading(false);
    }
  }, [demo, xpData]);

  // For demo mode, update XP data only when triggerUpdate changes.
  useEffect(() => {
    if (demo && xpData) {
      setXpData((prevData) => {
        let { level, total_xp, next_level_xp } = prevData;
        // Increase XP by a random amount between 5 and 14.
        const increment = Math.floor(Math.random() * 10) + 5;
        total_xp += increment;
        if (total_xp >= next_level_xp) {
          level++;
          total_xp = 0; // Reset XP for the new level.
          next_level_xp = 100 + (level - 1) * 50; // Arbitrary scaling.
        }
        return { level, total_xp, next_level_xp };
      });
    }
  }, [triggerUpdate, demo]);

  // For real users, fetch XP data from API.
  useEffect(() => {
    if (!demo && userId) {
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
      fetchXP();
    }
  }, [userId, triggerUpdate, demo]);

  useEffect(() => {
    if (xpData) {
      const newLevel = xpData.level;
      let relativeXP, levelRequirement;
      if (demo) {
        // In demo mode, xpData.total_xp and xpData.next_level_xp are assumed numbers.
        relativeXP = Number(xpData.total_xp);
        levelRequirement = Number(xpData.next_level_xp);
      } else {
        // For real users, ensure the values are parsed to numbers.
        const cumulativeXP = parseFloat(xpData.total_xp);
        const nextLevelCumulative = parseFloat(xpData.next_level_xp);
        const prevLevelThreshold = newLevel > 1 ? ((newLevel - 1) ** 2) * 100 : 0;
        relativeXP = cumulativeXP - prevLevelThreshold;
        levelRequirement = nextLevelCumulative - prevLevelThreshold;
      }
      const progressPercentage = (relativeXP / levelRequirement) * 100;

      // Determine if a level-up occurred.
      const isLevelUp = newLevel > prevLevelRef.current;
      if (isLevelUp) {
        setRankedUp(true);
        setProgressWidth("0%");
        prevRelativeXPRef.current = 0;
        setTimeout(() => {
          requestAnimationFrame(() => {
            setProgressWidth(`${Math.min(progressPercentage, 100)}%`);
          });
        }, 100);
        setTimeout(() => setRankedUp(false), 2000);
      } else {
        requestAnimationFrame(() => {
          setProgressWidth(`${Math.min(progressPercentage, 100)}%`);
        });
      }

      // Animate the displayed XP numbers.
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
        {displayXP.toFixed(2)} XP / {Number(displayNextLevelXP).toFixed(2)} XP needed for next level
      </p>
    </div>
  );
};

export default XPProgressBar;
