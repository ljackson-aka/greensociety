import React, { useState } from "react";
import { Auth } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import "./AuthContainer.css";

const AuthContainer = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("signin"); // Modes: signin, signup, confirm, forgotPassword, resetPassword
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredUsername, setPreferredUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email, preferred_username: preferredUsername },
      });
      setMessage("Sign-up successful! Check your email for the confirmation code.");
      setMode("confirm");
    } catch (err) {
      setError(err.message || "Error signing up");
    }
  };

  // Confirm Sign Up
  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    try {
      await Auth.confirmSignUp(email, code);
      setMessage("Confirmation successful! Please sign in.");
      setMode("signin");
    } catch (err) {
      setError(err.message || "Error confirming sign up");
    }
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await Auth.signIn(email, password);
      onAuthSuccess();
    } catch (err) {
      setError(err.message || "Error signing in");
    }
  };

  // Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await Auth.forgotPassword(email);
      setMessage("Verification code sent to your email.");
      setMode("resetPassword");
    } catch (err) {
      setError(err.message || "Error sending verification code");
    }
  };

  // Handle Password Reset with Confirmation
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    try {
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      setMessage("Password reset successful! Please sign in with your new password.");
      setMode("signin");
    } catch (err) {
      setError(err.message || "Error resetting password");
    }
  };

  return (
    <div className="auth-container">
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {mode === "signin" && (
        <form onSubmit={handleSignIn}>
          <h2>Sign In</h2>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Sign In</button>
          <button type="button" onClick={() => setMode("forgotPassword")}>Forgot Password?</button>
          <button type="button" onClick={() => setMode("signup")}>Sign Up</button>
        </form>
      )}

      {mode === "signup" && (
        <form onSubmit={handleSignUp}>
          <h2>Sign Up</h2>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Preferred Username" onChange={(e) => setPreferredUsername(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit">Sign Up</button>
        </form>
      )}

      {mode === "confirm" && (
        <form onSubmit={handleConfirmSignUp}>
          <h2>Confirm Sign Up</h2>
          <input type="text" placeholder="Confirmation Code" onChange={(e) => setCode(e.target.value)} required />
          <button type="submit">Confirm</button>
        </form>
      )}

      {mode === "forgotPassword" && (
        <form onSubmit={handleForgotPassword}>
          <h2>Forgot Password</h2>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit">Send Verification Code</button>
        </form>
      )}

      {mode === "resetPassword" && (
        <form onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <input type="text" placeholder="Verification Code" onChange={(e) => setCode(e.target.value)} required />
          <input type="password" placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm New Password" onChange={(e) => setConfirmNewPassword(e.target.value)} required />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default AuthContainer;
