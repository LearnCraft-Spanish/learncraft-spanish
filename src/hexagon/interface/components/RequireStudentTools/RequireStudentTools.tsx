import type { JSX, ReactNode } from 'react';
import { useStudentToolsAccess } from '@application/useCases/useStudentToolsAccess';
import { Navigate } from 'react-router-dom';

interface RequireStudentToolsProps {
  children: ReactNode;
}

/**
 * Route guard for student-only tools. Coaches/admins who have not chosen a
 * student to use the app as are sent home; everyone else passes through to
 * the route's own role checks.
 */
export function RequireStudentTools({
  children,
}: RequireStudentToolsProps): JSX.Element | null {
  const { allowed, isLoading } = useStudentToolsAccess();

  if (isLoading) return null;
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}
