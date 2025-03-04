import React from "react";
import badgeImage from "./TrailblazerBadge.png.webp"; // image is directly under src

const TrailblazerBadge = ({ isTrailblazer }) => {
  if (!isTrailblazer) return null;
  
  return (
    <div className="trailblazer-badge">
      <img src={badgeImage} alt="Trailblazer Badge" className="trailblazer-icon" />
      <span className="badge-text">Trailblazer</span>
    </div>
  );
};

export default TrailblazerBadge;
