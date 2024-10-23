import React from "react";
import useAuth from "../../hooks/useAuth";

function LogoutButton(): JSX.Element | false {
  const { isAuthenticated, logout } = useAuth();

  return (
    isAuthenticated && (
      <button
        type="button"
        id="logout"
        className={window.location.pathname === "/" ? " " : "notRoot"}
        onClick={logout}
      >
        Log Out
      </button>
    )
  );
}

export default LogoutButton;
