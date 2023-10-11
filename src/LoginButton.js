import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  return (!isAuthenticated && !isLoading && (
    <button onClick={() => loginWithRedirect()}>Log in/Register</button>
  ))
};

export default LoginButton;