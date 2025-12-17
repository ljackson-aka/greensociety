// HardcoreStrainForm.js
import React, { useState } from "react";
import { Auth } from "aws-amplify";
import "./StrainForm.css";

const HardcoreStrainForm = ({ userId, onEntryLogged, previousStrains = [] }) => {
  const [strainName, setStrainName] = useState("");
  const [strainType, setStrainType] = useState("");
  const [method, setMethod] = useState("");
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState("");

  const SESSION_API_URL =
    "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";
  const WEIGHT_API_URL =
    "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/update-weight";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strainName || !strainType || !method || !weight) {
      setMessage("All fields are required!");
      return;
    }

    // Demo mode
    if (!userId) {
      setMessage("Demo: Entry logged successfully!");
      setTimeout(() => setMessage(""), 3000);
      setStrainName("");
      setStrainType("");
      setMethod("");
      setWeight("");
      if (onEntryLogged) onEntryLogged();
      return;
    }

    try {
      // 🔐 Get Cognito ID token ONCE
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      // 1️⃣ Log the session (no weight)
      const sessionPayload = {
        user_id: userId,
        strain_name: strainName,
        strain_type: strainType,
        method: method,
      };

      const sessionResponse = await fetch(SESSION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!sessionResponse.ok) {
        throw new Error(
          `Session submission failed with status: ${sessionResponse.status}`
        );
      }

      const sessionData = await sessionResponse.json();
      const timestamp = sessionData.timestamp;

      if (!timestamp) {
        throw new Error("Timestamp not returned from session logging.");
      }

      // 2️⃣ Update the weight
      const weightPayload = {
        user_id: userId,
        timestamp: timestamp,
        weight: weight,
      };

      const weightResponse = await fetch(WEIGHT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(weightPayload),
      });

      if (!weightResponse.ok) {
        throw new Error(
          `Weight update failed with status: ${weightResponse.status}`
        );
      }

      await weightResponse.json();

      setMessage("Entry and weight updated successfully!");
      setStrainName("");
      setStrainType("");
      setMethod("");
      setWeight("");

      if (onEntryLogged) onEntryLogged();
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Failed to submit: ${error.message}`);
    }
  };

  return (
    <div className="strain-form">
      <h2>Hardcore Session</h2>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="strainName">Strain Name:</label>
            <input
              id="strainName"
              type="text"
              list="strain-options"
              value={strainName}
              onChange={(e) => setStrainName(e.target.value)}
              required
            />
            <datalist id="strain-options">
              {previousStrains.map((strain, index) => (
                <option key={index} value={strain} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="strainType">Strain Type:</label>
            <select
              id="strainType"
              value={strainType}
              onChange={(e) => setStrainType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="Indica">Indica</option>
              <option value="Sativa">Sativa</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="method">Method:</label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <option value="">Select Method</option>
              <option value="Blunt">Blunt</option>
              <option value="Joint">Joint</option>
              <option value="Bowl">Bowl</option>
            </select>
          </div>

          <div className="form-group weight-group">
            <label htmlFor="weight">Weight (grams):</label>
            <input
              id="weight"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setWeight(val.toFixed(2));
                }
              }}
              required
            />
          </div>
        </div>
        <button type="submit">Log Entry</button>
      </form>
    </div>
  );
};

export default HardcoreStrainForm;
