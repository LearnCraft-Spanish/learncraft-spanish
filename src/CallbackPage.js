import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CallbackPage = () => {
  const { isAuthenticated, isLoading, logout } = useAuth0();

  return (<h3>You will be redirected.</h3>)
};

export default CallbackPage;