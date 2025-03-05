// AuthContainer.js
import React, { useState } from "react";
import { Auth } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import "./AuthContainer.css"; // Import our custom styles

const AuthContainer = ({ onAuthSuccess }) => {
  // Modes: "signup", "confirm", "signin"
  const [mode, setMode] = useState("signup");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Sign up fields
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredUsername, setPreferredUsername] = useState("");
  
  // Confirmation code field
  const [code, setCode] = useState("");
  
  const [error, setError] = useState("");

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!preferredUsername) {
      setError("Preferred Username is required.");
      return;
    }
    setIsAuthenticating(true);
    try {
      await Auth.signUp({
        username: email, // use email as the username
        password,
        attributes: {
          email, // required attribute
          preferred_username: preferredUsername, // required by your pool
        },
      });
      setError("Sign up successful! A confirmation code has been sent to your email.");
      setMode("confirm");
    } catch (err) {
      setError(err.message || "Error signing up");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle confirmation of sign-up with code.
  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the confirmation code.");
      return;
    }
    setIsAuthenticating(true);
    try {
      await Auth.confirmSignUp(email, code);
      setError("Confirmation successful! Please sign in.");
      setMode("signin");
    } catch (err) {
      setError(err.message || "Error confirming sign up");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    try {
      const user = await Auth.signIn(email, password);
      if (user && user.signInUserSession && user.signInUserSession.accessToken) {
        onAuthSuccess();
      } else {
        setError("Authentication token not available. Ensure your account is confirmed.");
      }
    } catch (err) {
      setError(err.message || "Error signing in");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="auth-container">
      {isAuthenticating && <p className="loading-message">Authenticating, please wait...</p>}
      {mode === "signup" && (
        <div className="signup-form">
          <h2>Sign Up</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignUp}>
            <div className="form-field">
              <label>Email (this will be your username):</label>
              <input
                type="email"
                value={email}
                placeholder="example@domain.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <div className="form-field">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <div className="form-field">
              <label>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                placeholder="Please confirm your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <div className="form-field">
              <label>Preferred Username:</label>
              <input
                type="text"
                value={preferredUsername}
                placeholder="Enter your preferred username"
                onChange={(e) => setPreferredUsername(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <button type="submit" disabled={isAuthenticating}>
              Sign Up
            </button>
          </form>
          <p>
            Already have an account?{" "}
            <button className="link" onClick={() => { setMode("signin"); setError(""); }} disabled={isAuthenticating}>
              Sign In
            </button>
          </p>
        </div>
      )}
      {mode === "confirm" && (
        <div className="confirm-form">
          <h2>Confirm Sign Up</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleConfirmSignUp}>
            <div className="form-field">
              <label>Confirmation Code:</label>
              <input
                type="text"
                value={code}
                placeholder="Enter confirmation code"
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <button type="submit" disabled={isAuthenticating}>
              Confirm
            </button>
          </form>
          <p>
            Didn't receive a code?{" "}
            <button className="link" onClick={() => { setMode("signup"); setError(""); }} disabled={isAuthenticating}>
              Back to Sign Up
            </button>
          </p>
        </div>
      )}
      {mode === "signin" && (
        <div className="signin-form">
          <h2>Sign In</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignIn}>
            <div className="form-field">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                placeholder="example@domain.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <div className="form-field">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
            <button type="submit" disabled={isAuthenticating}>
              Sign In
            </button>
          </form>
          <p>
            Don't have an account?{" "}
            <button className="link" onClick={() => { setMode("signup"); setError(""); }} disabled={isAuthenticating}>
              Sign Up
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthContainer;
