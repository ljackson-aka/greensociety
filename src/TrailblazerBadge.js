const TrailblazerBadge = ({ isTrailblazer }) => {
    if (!isTrailblazer) return null;
    
    return (
      <div className="trailblazer-badge">
        <img src="/TrailblazerBadge.png.webp" alt="Trailblazer Badge" className="trailblazer-icon" />
        <span className="badge-text">Trailblazer</span>
      </div>
    );
  };
  
  export default TrailblazerBadge;
  