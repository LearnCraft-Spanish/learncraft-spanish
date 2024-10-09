import type { ReactNode } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";

// Create a custom renderHook with context wrapper
interface contextProps {
  children: ReactNode;
  studentEmail?: string;
}

export default function MockAuth0Provider({ children }: contextProps) {
  return (
    <Auth0Provider
      domain="test-domain"
      clientId="test-client-id"
      authorizationParams={{
        redirect_uri: "http://localhost:3000",
        audience: "test-audience",
        scope: "test-scope",
      }}
    >
      {children}
    </Auth0Provider>
  );
}
