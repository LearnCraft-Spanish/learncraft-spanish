import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent';
import { useMyData } from '@application/queries/useMyData';
import { useCallback } from 'react';

export interface UsingAsIdentity {
  name: string;
  email: string;
}

export interface UseAppHeaderResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  studentName: string | undefined;
  studentEmail: string | undefined;
  /** Coach or admin: gets the "Use as student" controls. */
  isStaff: boolean;
  /** Which staff view "Stop using as student" returns to. */
  staffRole: 'admin' | 'coach' | null;
  isUsingAsStudent: boolean;
  /** The student a coach/admin is using the app as, once loaded. */
  usingAs: UsingAsIdentity | null;
  /** Back to the signed-in coach/admin's own view. */
  stopUsingAsStudent: () => void;
  login: () => void;
  logout: () => void;
}

/**
 * Identity for the shared `AppHeader` account menu: whether the visitor is
 * signed in, their own display name/email, and the auth actions. The name
 * comes from the signed-in user's own record, never the active student, so
 * it stays correct while a coach/admin is using the app as someone else;
 * that student is reported separately as `usingAs`.
 */
export default function useAppHeader(): UseAppHeaderResult {
  const {
    isAuthenticated,
    isLoading,
    authUser,
    isAdmin,
    isCoach,
    login,
    logout,
  } = useAuthAdapter();
  const { myData } = useMyData();
  const { appUser, resetActiveStudent } = useActiveStudent();
  const { isUsingAsStudent, setIsUsingAsStudent } = useUsingAsStudent();

  const usingAs =
    isUsingAsStudent && appUser
      ? { name: appUser.name, email: appUser.emailAddress }
      : null;

  const stopUsingAsStudent = useCallback(() => {
    resetActiveStudent();
    setIsUsingAsStudent(false);
  }, [resetActiveStudent, setIsUsingAsStudent]);

  return {
    isAuthenticated,
    isLoading,
    studentName: myData?.name,
    studentEmail: authUser?.email,
    isStaff: isAdmin || isCoach,
    staffRole: isAdmin ? 'admin' : isCoach ? 'coach' : null,
    isUsingAsStudent,
    usingAs,
    stopUsingAsStudent,
    login,
    logout,
  };
}
