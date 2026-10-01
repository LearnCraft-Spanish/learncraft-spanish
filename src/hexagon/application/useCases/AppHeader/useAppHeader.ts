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
  /** Auth has settled and the visitor is logged in. */
  isSignedIn: boolean;
  studentName: string | undefined;
  studentEmail: string | undefined;
  /** Coach or admin: the account menu can open the student picker. */
  isStaff: boolean;
  /** Which staff view "Stop using as student" returns to. */
  staffRole: 'admin' | 'coach' | null;
  /** Signed-in coach/admin in their own view: "Use as student" replaces the student nav. */
  showUseAsStudent: boolean;
  /** Coach/admin using the app as a student: "Change student", and a way back instead of Log out. */
  isStaffUsingAsStudent: boolean;
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

  const isSignedIn = !isLoading && isAuthenticated;
  const isStaff = isAdmin || isCoach;
  const isStaffUsingAsStudent = isStaff && isUsingAsStudent;

  const usingAs =
    isStaffUsingAsStudent && appUser
      ? { name: appUser.name, email: appUser.emailAddress }
      : null;

  const stopUsingAsStudent = useCallback(() => {
    resetActiveStudent();
    setIsUsingAsStudent(false);
  }, [resetActiveStudent, setIsUsingAsStudent]);

  return {
    isAuthenticated,
    isLoading,
    isSignedIn,
    studentName: myData?.name,
    studentEmail: authUser?.email,
    isStaff,
    staffRole: isAdmin ? 'admin' : isCoach ? 'coach' : null,
    showUseAsStudent: isSignedIn && isStaff && !isUsingAsStudent,
    isStaffUsingAsStudent,
    usingAs,
    stopUsingAsStudent,
    login,
    logout,
  };
}
