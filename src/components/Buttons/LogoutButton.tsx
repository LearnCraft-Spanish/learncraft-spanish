import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

function LogoutButton(): JSX.Element | false {
  const { isAuthenticated, logout } = useAuth0()

  return (
    isAuthenticated && (
      <button
        type="button"
        id="logout"
        className={window.location.pathname === '/' ? ' ' : 'notRoot'}
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })}
      >
        Log Out
      </button>
    )
  )
}

export default LogoutButton
