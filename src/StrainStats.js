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

  const methods = ["Bowl", "Joint", "Blunt"];
  let totalCounts = { Bowl: 0, Joint: 0, Blunt: 0 };
  let strainBreakdown = {};
  let typeCounts = {};

  entries.forEach(({ strain_name, strain_type, method }) => {
    totalCounts[method] = (totalCounts[method] || 0) + 1;

    if (!strainBreakdown[strain_name]) {
      strainBreakdown[strain_name] = { Bowl: 0, Joint: 0, Blunt: 0 };
    }
    strainBreakdown[strain_name][method]++;

    typeCounts[strain_type] = (typeCounts[strain_type] || 0) + 1;
  });

  const preferredType = Object.entries(typeCounts).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: "N/A", count: 0 }
  ).type;

  const preferredMethod = Object.entries(totalCounts).reduce(
    (max, [method, count]) => (count > max.count ? { method, count } : max),
    { method: "N/A", count: 0 }
  ).method;

  const strainCounts = Object.entries(strainBreakdown).map(([strain, counts]) => ({
    strain,
    total: Object.values(counts).reduce((sum, curr) => sum + curr, 0),
  }));

  const dominantStrain = strainCounts.reduce(
    (max, curr) => (curr.total > max.total ? curr : max),
    { strain: "N/A", total: 0 }
  ).strain;

  const weightEntries = entries.filter((entry) => entry.weight);
  let gpd = "N/A";
  let totalWeight = 0;

  if (weightEntries.length > 0) {
    weightEntries.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    totalWeight = weightEntries.reduce((sum, entry) => sum + parseFloat(entry.weight), 0);
    const earliest = Number(weightEntries[0].timestamp);
    const latest = Number(weightEntries[weightEntries.length - 1].timestamp);
    const days = Math.max((latest - earliest) / 86400000, 1);
    gpd = (totalWeight / days).toFixed(2);
  }

  const lifetimeGrams = totalWeight.toFixed(2);
  const lifetimeOunces = (totalWeight / 28.35).toFixed(2);
  const lifetimePounds = (totalWeight / 453.592).toFixed(2);

  return (
    <div className="strain-stats">
      <h2>Statistics</h2>

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
        <div className="preferred-item">
          <span className="preferred-label">G.P.D.:</span>
          <span className="preferred-value">{gpd} g</span>
        </div>
        <div className="preferred-item">
          <span className="preferred-label">Lifetime Grams:</span>
          <span className="preferred-value">{lifetimeGrams} g</span>
        </div>
        <div className="preferred-item">
          <span className="preferred-label">Lifetime Ounces:</span>
          <span className="preferred-value">{lifetimeOunces} oz</span>
        </div>
        <div className="preferred-item">
          <span className="preferred-label">Lifetime Pounds:</span>
          <span className="preferred-value">{lifetimePounds} lb</span>
        </div>
      </div>

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
            .sort(([a], [b]) => a.localeCompare(b))
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
