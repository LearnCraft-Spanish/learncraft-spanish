import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';

export interface UseAppHeaderResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  studentName: string | undefined;
  studentEmail: string | undefined;
  login: () => void;
  logout: () => void;
}

/**
 * Identity for the shared `AppHeader` account menu: whether the visitor is
 * signed in, their display name/email, and the auth actions.
 *
 * Deliberately does not reflect a coach/admin's active-student selection —
 * this is the signed-in user's own account, not whoever they are currently
 * viewing. Known gap: while a coach/admin has a different student selected,
 * `appUser` briefly has no fetch of the coach's own name, so `studentName`
 * falls back to `undefined` (the menu still shows the real email and logs
 * the real account out).
 */
export default function useAppHeader(): UseAppHeaderResult {
  const { isAuthenticated, isLoading, authUser, login, logout } =
    useAuthAdapter();
  const { appUser, isOwnUser } = useActiveStudent();

  return {
    isAuthenticated,
    isLoading,
    studentName: isOwnUser ? appUser?.name : undefined,
    studentEmail: authUser?.email,
    login,
    logout,
  };
}
