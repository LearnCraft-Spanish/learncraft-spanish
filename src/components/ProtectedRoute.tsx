import React from 'react';
import { useUserData } from 'src/hooks/UserData/useUserData';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userDataQuery = useUserData();
  const adminRole = userDataQuery.data?.roles.adminRole;
  const hasAccess = adminRole === 'admin';

  if (!hasAccess) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return <>{children}</>;
}
