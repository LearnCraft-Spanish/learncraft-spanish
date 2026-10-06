import type { StudentToolScope } from '@domain/studentAccess';
import type { JSX, ReactNode } from 'react';
import { useStudentToolsAccess } from '@application/useCases/useStudentToolsAccess';
import { Navigate } from 'react-router-dom';

interface RequireStudentToolsProps {
  children: ReactNode;
  /** `catalog` for Flashcard Finder and Custom Quiz. Defaults to `student`. */
  scope?: StudentToolScope;
}

/**
 * Route guard for student-only tools. Coaches/admins who have not chosen a
 * student to use the app as are sent home, except from catalog tools; everyone
 * else passes through to the route's own role checks.
 */
export function RequireStudentTools({
  children,
  scope,
}: RequireStudentToolsProps): JSX.Element | null {
  const { allowed, isLoading } = useStudentToolsAccess(scope);

  if (isLoading) return null;
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}
