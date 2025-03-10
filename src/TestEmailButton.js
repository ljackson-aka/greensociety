// src/TestEmailButton.js
import React, { useState } from "react";
import { sendMassEmail } from "./emailHelper";

const TestEmailButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendMassEmail();
      setResult(res);
    } catch (err) {
      setError(err.message || "An error occurred.");
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Processing..." : "Test Send Mass Email (Dry Run)"}
      </button>
      {result && (
        <div>
          <h4>Dry Run Result</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div>
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TestEmailButton;
