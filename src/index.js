import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Amplify and AWS configuration
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

// Import Authenticator component
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify
Amplify.configure(awsconfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Authenticator loginMechanisms={["email"]} signUpAttributes={["email", "preferred_username"]}>
    {({ signOut, user }) => <App user={user} signOut={signOut} />}
  </Authenticator>
);
