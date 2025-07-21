import { useAuthAdapter } from '@application/adapters/authAdapter';
import React from 'react';

function LoginButton(): React.JSX.Element | false {
  const { isAuthenticated, isLoading, login } = useAuthAdapter();

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
