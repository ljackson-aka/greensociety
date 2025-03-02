import React from "react";
import "./StrainStats.css";

const StrainStats = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="strain-stats">
        <h2>Statistics</h2>
        <p>No data available yet. Log some strains to see stats!</p>
      </div>
    );
  }

  // Define methods order for consistent display
  const methods = ["Bowl", "Joint", "Blunt"];

  // Initialize counts
  let totalCounts = { Bowl: 0, Joint: 0, Blunt: 0 };
  let strainBreakdown = {};
  let typeCounts = {};

  // Aggregate data efficiently in one loop
  entries.forEach(({ strain_name, strain_type, method }) => {
    // Count method usage
    totalCounts[method] = (totalCounts[method] || 0) + 1;

    // Count strain breakdown per method
    if (!strainBreakdown[strain_name]) {
      strainBreakdown[strain_name] = { Bowl: 0, Joint: 0, Blunt: 0 };
    }
    strainBreakdown[strain_name][method]++;

    // Count strain type occurrences
    typeCounts[strain_type] = (typeCounts[strain_type] || 0) + 1;
  });

  // Determine the most common strain type
  const preferredType =
    Object.entries(typeCounts).reduce(
      (max, [type, count]) => (count > max.count ? { type, count } : max),
      { type: "N/A", count: 0 }
    ).type;

  // Determine the preferred method (most frequently used method)
  const preferredMethod =
    Object.entries(totalCounts).reduce(
      (max, [method, count]) => (count > max.count ? { method, count } : max),
      { method: "N/A", count: 0 }
    ).method;

  // Calculate total occurrences for each strain (summed across methods)
  const strainCounts = Object.entries(strainBreakdown).map(([strain, counts]) => ({
    strain,
    total: Object.values(counts).reduce((sum, curr) => sum + curr, 0),
  }));

  // Determine the most dominant strain (highest usage)
  const dominantStrain =
    strainCounts.reduce((max, curr) => (curr.total > max.total ? curr : max), {
      strain: "N/A",
      total: 0,
    }).strain;

  return (
    <div className="strain-stats">
      <h2>Statistics</h2>

      {/* Preferred Type, Preferred Method, and Most Logged Strain */}
      <div className="preferred-metrics">
        <div className="preferred-item">
          <span className="preferred-label">Prefers Type:</span>
          <span className="preferred-value">{preferredType}</span>
        </div>
        <div className="preferred-item">
          <span className="preferred-label">Preferred Method:</span>
          <span className="preferred-value">{preferredMethod}</span>
        </div>
        <div className="preferred-item">
          <span className="preferred-label">Dominant Strain:</span>
          <span className="preferred-value">{dominantStrain}</span>
        </div>
      </div>

      {/* Total Method Counts */}
      <div className="stats-total">
        <h3>Total Methods</h3>
        <div className="stats-grid">
          {methods.map((method) => (
            <div key={method} className="stats-cell">
              <div className="stats-header">{method}s</div>
              <div className="stats-value">{totalCounts[method] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown of Strains by Method */}
      <div className="stats-breakdown">
        <h3>Unique Strains Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-row header-row">
            <div className="breakdown-cell strain-name">Strain</div>
            {methods.map((method) => (
              <div key={method} className="breakdown-cell">{method}s</div>
            ))}
          </div>
          {Object.entries(strainBreakdown)
            .sort(([a], [b]) => a.localeCompare(b)) // Sort strains alphabetically
            .map(([strain, counts]) => (
              <div key={strain} className="breakdown-row">
                <div className="breakdown-cell strain-name">{strain}</div>
                {methods.map((method) => (
                  <div key={method} className="breakdown-cell">
                    {counts[method] || 0}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StrainStats;
