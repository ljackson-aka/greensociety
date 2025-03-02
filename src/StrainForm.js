import React, { useState, useEffect } from "react";
import "./StrainForm.css";

const StrainForm = ({ userId, onEntryLogged, previousStrains }) => {
  const [strainName, setStrainName] = useState("");
  const [strainType, setStrainType] = useState("");
  const [method, setMethod] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/strain-entry";

  // 🛠 Ensure previousStrains is formatted correctly
  console.log("🔍 Raw Previous Strains:", previousStrains);

  let formattedStrains = [];
  let strainTypeMap = {};

  if (Array.isArray(previousStrains)) {
    formattedStrains = previousStrains.map((strain) => {
      if (typeof strain === "string") {
        return { strain_name: strain, strain_type: "" }; // Default empty if no type
      } else if (strain && strain.strain_name) {
        return strain;
      }
      return null;
    }).filter(Boolean);

    // Create strain type lookup map
    strainTypeMap = formattedStrains.reduce((acc, strain) => {
      acc[strain.strain_name.toLowerCase().trim()] = strain.strain_type || "Unknown";
      return acc;
    }, {});
  }

  console.log("✅ Formatted Strains for Dropdown:", formattedStrains);
  console.log("📌 Strain Type Mapping:", strainTypeMap);

  // Auto-fill strain type when a strain is selected
  useEffect(() => {
    if (strainName) {
      const normalizedStrain = strainName.toLowerCase().trim();
      if (strainTypeMap[normalizedStrain] && strainTypeMap[normalizedStrain] !== "Unknown") {
        setStrainType(strainTypeMap[normalizedStrain]); // ✅ Auto-fill strain type
        console.log("🔄 Auto-filled Strain Type:", strainTypeMap[normalizedStrain]);
      } else {
        setStrainType(""); // Reset if no match
      }
    }
  }, [strainName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strainName || !strainType || !method) {
      setMessage("All fields are required!");
      return;
    }

    const formData = {
      user_id: userId,
      strain_name: strainName,
      strain_type: strainType,
      method: method,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("✅ Success:", await response.json());
      setMessage("Entry logged successfully!");

      // Reset form
      setStrainName("");
      setStrainType("");
      setMethod("");

      if (onEntryLogged) onEntryLogged();
    } catch (error) {
      console.error("❌ Error:", error);
      setMessage(`Failed to submit: ${error.message}`);
    }
  };

  return (
    <div className="strain-form">
      <h2>Log Your Strain</h2>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Strain Name:
          <input
            type="text"
            list="strain-options"
            value={strainName}
            onChange={(e) => setStrainName(e.target.value)}
            required
          />
          <datalist id="strain-options">
            {formattedStrains.map((strain, index) => (
              <option key={index} value={strain.strain_name} />
            ))}
          </datalist>
        </label>

        <label>
          Strain Type:
          <select value={strainType} onChange={(e) => setStrainType(e.target.value)} required>
            <option value="">Select Type</option>
            <option value="Indica">Indica</option>
            <option value="Sativa">Sativa</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </label>

        <label>
          Method:
          <select value={method} onChange={(e) => setMethod(e.target.value)} required>
            <option value="">Select Method</option>
            <option value="Blunt">Blunt</option>
            <option value="Joint">Joint</option>
            <option value="Bowl">Bowl</option>
          </select>
        </label>

        <button type="submit">Log Entry</button>
      </form>
    </div>
  );
};

export default StrainForm;
