import React, { useState, useEffect } from "react";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const USERS_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/users";
  const TOGGLE_BAN_API_URL = "https://lfefnjm626.execute-api.us-east-2.amazonaws.com/prod/toggle-ban";

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

      // Update UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === updatedUser.email ? { ...user, banned: updatedUser.banned } : user
        )
      );
    } catch (err) {
      alert("Error toggling ban: " + err.message);
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
        <table border="1" cellPadding="8" cellSpacing="0">
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
                  <button onClick={() => handleToggleBan(user.email)}>
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserManagement;
