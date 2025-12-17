// CasualStrainForm.js
import React, { useState } from "react";
import { Auth } from "aws-amplify";
import "./StrainForm.css";

const CasualStrainForm = ({ userId, onEntryLogged, previousStrains = [] }) => {
  const [strainName, setStrainName] = useState("");
  const [strainType, setStrainType] = useState("");
  const [method, setMethod] = useState("");
  const [message, setMessage] = useState("");

  const API_URL =
    "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strainName || !strainType || !method) {
      setMessage("All fields are required!");
      return;
    }

    // Demo mode (no auth, no API call)
    if (!userId) {
      setMessage("Demo: Entry logged successfully!");
      setTimeout(() => setMessage(""), 3000);
      setStrainName("");
      setStrainType("");
      setMethod("");
      if (onEntryLogged) onEntryLogged();
      return;
    }

    const formData = {
      user_id: userId,
      strain_name: strainName,
      strain_type: strainType,
      method: method,
    };

    try {
      // 🔐 Get Cognito ID token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Success:", data);

      setMessage("Entry logged successfully!");
      setStrainName("");
      setStrainType("");
      setMethod("");

      if (onEntryLogged) onEntryLogged();
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Failed to submit: ${error.message}`);
    }
  };

  return (
    <div className="strain-form">
      <h2>Casual Session</h2>
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
        </div>
        <button type="submit">Log Entry</button>
      </form>
    </div>
  );
};

export default CasualStrainForm;
