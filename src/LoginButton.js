import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  return (!isAuthenticated && !isLoading && (
  <button style = {{width: '150px', margin: '20px'}} onClick={() => loginWithRedirect()}>Log In</button>
  ))
};

export default LoginButton;