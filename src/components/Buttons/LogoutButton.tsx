import { useAuthAdapter } from '@application/adapters/authAdapter';
import React from 'react';

function LogoutButton(): React.JSX.Element | false {
  const { isAuthenticated, logout } = useAuthAdapter();

  return (
    isAuthenticated && (
      <button
        type="button"
        id="logout"
        className={window.location.pathname === '/' ? ' ' : 'notRoot'}
        onClick={logout}
      >
        Log Out
      </button>
    )
  );
}

export default LogoutButton;
