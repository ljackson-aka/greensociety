/* eslint-disable */
// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "us-east-2",
    "Auth": {
        "region": "us-east-2",
        "userPoolId": "us-east-2_LPhLKJBxM",
        "userPoolWebClientId": "6bnjf4pi18dcs1viu85oufftth",
        "signInAttributes": [
            "email"
        ],
        "signUpAttributes": [
            "email",
            "preferred_username"
        ],
        "authenticationFlowType": "USER_SRP_AUTH",
        "oauth": {
            "domain": "s-east-2lphlkjbxm.auth.us-east-2.amazoncognito.com",
            "scope": [
                "openid",
                "email",
                "profile"
            ],
            "redirectSignIn": [
                "http://localhost:3000/"
            ],
            "redirectSignOut": [
                "http://localhost:3000/"
            ],
            "responseType": "code"
        }
    }
};


export default awsmobile;
