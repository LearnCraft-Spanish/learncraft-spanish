import React from 'react';
import useAuth from 'src/hooks/useAuth';

function LoginButton(): JSX.Element | false {
  const { isAuthenticated, isLoading, login } = useAuth();

  return (
    !isAuthenticated &&
    !isLoading && (
      <button type="button" id="login" onClick={login}>
        Log in/Register
      </button>
    )
  );
}

export default LoginButton;
