import { useAuthAdapter } from '@application/adapters/authAdapter';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdmin } = useAuthAdapter();
  const hasAccess = isAdmin;

  if (!hasAccess) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return <>{children}</>;
}
