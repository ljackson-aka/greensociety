// AdminDashboard.js
import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import AdminUserManagement from "./AdminUserManagement";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the authenticated user belongs to the "Admin" group.
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        // Groups are available in the access token payload under "cognito:groups"
        const groups = user.signInUserSession.accessToken.payload["cognito:groups"] || [];
        setIsAdmin(groups.includes("Admin"));
      } catch (error) {
        console.error("Error checking admin group:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <p>Loading Admin Dashboard...</p>;
  }

  if (!isAdmin) {
    return <p>Access Denied: You are not authorized to view this page.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>
        Here you can manage users, filter by engagement, manage bans or approvals,
        view top ranked users and XP trends, and manually award or revoke badges.
        Log monitoring and additional admin functions will be added soon.
      </p>
      <AdminUserManagement />
    </div>
  );
};

export default AdminDashboard;
