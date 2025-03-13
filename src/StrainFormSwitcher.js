import React, { useState, useEffect } from "react";
import CasualStrainForm from "./CasualStrainForm";
import HardcoreStrainForm from "./HardcoreStrainForm";
import "./StrainFormSwitcher.css";

const StrainFormSwitcher = ({ userId, onEntryLogged, previousStrains = [] }) => {
  const [formType, setFormType] = useState("Casual");
  const [hardcoreStart, setHardcoreStart] = useState(null);

  // Use a unique key for each user. For logged-in users, this key includes their userId.
  const hardcoreKey = userId ? `hardcoreStart_${userId}` : "hardcoreStart";

  // On mount (or when userId changes), load the Hardcore start time from localStorage.
  useEffect(() => {
    if (userId) {
      const storedStart = localStorage.getItem(hardcoreKey);
      if (storedStart) {
        setHardcoreStart(Number(storedStart));
        setFormType("Hardcore");
      }
    }
  }, [userId, hardcoreKey]);

  const handleFormTypeChange = (e) => {
    const selectedForm = e.target.value;
    if (selectedForm === "Hardcore") {
      // Confirm Hardcore mode entry.
      const confirmed = window.confirm(
        "WARNING: You are about to enter Hardcore mode. Once selected, you must remain in Hardcore mode for 24 hours before switching back to Casual. Do you want to proceed?"
      );
      if (confirmed) {
        setFormType("Hardcore");
        const now = Date.now();
        setHardcoreStart(now);
        if (userId) {
          localStorage.setItem(hardcoreKey, now);
        }
      } else {
        // If canceled, remain in Casual.
        setFormType("Casual");
      }
    } else if (selectedForm === "Casual") {
      // Check if 24 hours have passed since Hardcore mode was entered.
      if (hardcoreStart && Date.now() - hardcoreStart < 24 * 60 * 60 * 1000) {
        window.alert(
          "You must endure Hardcore for at least 24 hours before returning to be a Casual."
        );
        setFormType("Hardcore");
      } else {
        // Allow switch back and clear the stored Hardcore start time.
        setFormType("Casual");
        setHardcoreStart(null);
        if (userId) {
          localStorage.removeItem(hardcoreKey);
        }
      }
    }
  };

  return (
    <div className="strain-form-switcher">
      <div className="form-type-selector">
        <label htmlFor="formType">Mode:</label>
        <select id="formType" value={formType} onChange={handleFormTypeChange}>
          <option value="Casual">Casual</option>
          <option value="Hardcore">Hardcore</option>
        </select>
      </div>
      {formType === "Casual" ? (
        <CasualStrainForm
          userId={userId}
          onEntryLogged={onEntryLogged}
          previousStrains={previousStrains}
        />
      ) : (
        <HardcoreStrainForm
          userId={userId}
          onEntryLogged={onEntryLogged}
          previousStrains={previousStrains}
        />
      )}
    </div>
  );
};

export default StrainFormSwitcher;
