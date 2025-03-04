// SignIn.js
import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const SignIn = ({ onSignIn }) => {
  return (
    <div className="signin-container">
      <Authenticator>
        {({ user }) => {
          if (user) {
            // Instead of simply setting the hash, force a reload.
            onSignIn();
          }
          return null;
        }}
      </Authenticator>
    </div>
  );
};

export default SignIn;
