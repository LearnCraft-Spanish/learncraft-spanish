import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import MenuButton from "./MenuButton";

const NotFoundPage = () => {
  const { isAuthenticated, isLoading, logout } = useAuth0();

  return(
    <div>
      <h3>404: Page Not Found</h3>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  )
};

export default NotFoundPage;