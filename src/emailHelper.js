// src/emailHelper.js
export const sendMassEmail = async () => {
    try {
      const response = await fetch("https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "ieKyK24ac34tloTT8oO1zaSvvAJeAPKW7dzXEVaK" // Replace with your actual API key
        },
        body: JSON.stringify({
          subject: "Dry Run Test",
          body: "This is a dry run email test.",
          dry_run: true
        })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log("Dry Run Successful:", result);
        console.log("Emails that would have been sent:", result.dry_run_emails);
        return result;
      } else {
        console.error("Dry Run Failed:", result.error);
        return result;
      }
    } catch (error) {
      console.error("Error making the request:", error);
      throw error;
    }
  };
  