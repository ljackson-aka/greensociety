import React, { useState, useEffect } from "react";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const USERS_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/users";
  const TOGGLE_BAN_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/toggle-ban";
  const AWARD_BADGE_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/award-badge";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(USERS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (email) => {
    try {
      const response = await fetch(TOGGLE_BAN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle ban");
      }

      const updatedUser = await response.json();

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === updatedUser.email ? { ...user, banned: updatedUser.banned } : user
        )
      );
    } catch (err) {
      alert("Error toggling ban: " + err.message);
    }
  };

  const handleAwardBadge = async (email) => {
    const badgeName = prompt("Enter badge name:");
    if (!badgeName) return;

    try {
      const response = await fetch(AWARD_BADGE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, badge: badgeName }),
      });

      if (!response.ok) {
        throw new Error("Failed to award badge");
      }

      alert(`Badge "${badgeName}" awarded to ${email}`);
    } catch (err) {
      alert("Error awarding badge: " + err.message);
    }
  };

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="user-table-container"> {/* Ensures table is scrollable */}
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Engagement</th>
                <th>Banned</th>
                <th>XP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.email}</td>
                  <td>{user.engagement}</td>
                  <td>{user.banned ? "Yes" : "No"}</td>
                  <td>{user.xp}</td>
                  <td>
                    <div className="button-group">
                      <button onClick={() => handleToggleBan(user.email)}>
                        {user.banned ? "Unban" : "Ban"}
                      </button>
                      <button onClick={() => handleAwardBadge(user.email)}>
                        Award Badge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
