import { useEffect, useState } from "react";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserDataFromBackend } from "./BackendFetchFunctions";

const Profile = ({ID, Name, Email}) => {
    const { user, isAuthenticated, isLoading } = useAuth0();

  if (Name === "Loading Name") {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div>
        <p>Welcome back, {Name}!</p>
        <p>{Email}</p>
        <p>{ID}</p>
      </div>
    )
  );
};

export default Profile;