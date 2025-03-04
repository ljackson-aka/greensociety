// xpService.js
export async function updateUserXP(userId) {
    try {
      // Replace with your actual API Gateway endpoint URL
      const endpoint = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/xp";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data; // data: { total_xp, entry_count, level, next_level_xp, last_reward }
    } catch (error) {
      console.error("Error updating user XP:", error);
      throw error;
    }
  }
  