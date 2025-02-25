import React from 'react';
import useAuth from 'src/hooks/useAuth';

function LogoutButton(): React.JSX.Element | false {
  const { isAuthenticated, logout } = useAuth();

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
