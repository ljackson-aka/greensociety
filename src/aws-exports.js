const awsconfig = {
  aws_project_region: "us-east-2",
  Auth: {
    region: "us-east-2",
    userPoolId: "us-east-2_LPhLKJBxM", // Your Cognito User Pool ID
    userPoolWebClientId: "6bnjf4pi18dcs1viu85oufftth", // Your Cognito App Client ID

    // Force Cognito to use email for signing in
    signInAttributes: ["email"],
    signUpAttributes: ["email", "preferred_username"], // Keep preferred_username but don't use for login

    // Ensure proper authentication flow
    authenticationFlowType: "USER_SRP_AUTH", // Secure Remote Password (SRP) authentication

    oauth: {
      domain: "s-east-2lphlkjbxm.auth.us-east-2.amazoncognito.com",
      scope: ["openid", "email", "profile"],
      redirectSignIn: ["http://localhost:3000/"],
      redirectSignOut: ["http://localhost:3000/"],
      responseType: "code",
    }
  }
};

export default awsconfig;
