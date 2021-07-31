import { AuthenticationDetails, CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.COGNITO_CLIENT_ID,
};

export const userPool = new CognitoUserPool(poolData);

export const cognitoSignUp = (email, password, name, location) => {
  return new Promise((resolve, reject) => {
    userPool.signUp(
      email,
      password,
      [
        {
          Name: 'name',
          Value: name,
        },
        {
          Name: 'custom:location',
          Value: location,
        },
      ],
      null,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );
  });
};

export const cognitoLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });
    user.authenticateUser(
      new AuthenticationDetails({
        Username: email,
        Password: password,
      }),
      {
        onSuccess: (result) => {
          // cognito token also returned but ignore until use
          return resolve(user);
        },
        onFailure: (error) => {
          return reject(error);
        },
      },
    );
  });
};
