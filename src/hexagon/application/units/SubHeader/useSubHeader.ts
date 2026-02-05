import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useMemo, useState } from 'react';

export default function useSubHeader() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    isCoach,
  } = useAuthAdapter();

  const {
    appUser,
    isOwnUser,
    isLoading: activeStudentLoading,
    changeActiveStudent,
  } = useActiveStudent();

  const [studentSelectorOpen, setStudentSelectorOpen] = useState(false);

  function clearSelection() {
    // Clear active student selection
    changeActiveStudent(null);
    setStudentSelectorOpen(false);
  }

  // Helper booleans
  const freeUser = useMemo(() => {
    return (
      isAuthenticated &&
      !appUser &&
      !activeStudentLoading &&
      !(isAdmin || isCoach)
    );
  }, [isAuthenticated, appUser, activeStudentLoading, isAdmin, isCoach]);

  const notLoggedIn = useMemo(() => {
    return !authLoading && !isAuthenticated;
  }, [authLoading, isAuthenticated]);

  const loggingIn = useMemo(() => authLoading, [authLoading]);

  const studentUser = useMemo(() => {
    return (
      isAuthenticated &&
      appUser &&
      !activeStudentLoading &&
      !(isAdmin || isCoach)
    );
  }, [isAuthenticated, appUser, activeStudentLoading, isAdmin, isCoach]);

  const isCoachOrAdmin = useMemo(() => {
    return isAdmin || isCoach;
  }, [isAdmin, isCoach]);
  return {
    authLoading,
    isAuthenticated,
    isAdmin,
    isCoach,
    appUser,
    isOwnUser,
    activeStudentLoading,
    studentSelectorOpen,
    setStudentSelectorOpen,
    clearSelection,

    freeUser,
    notLoggedIn,
    loggingIn,
    studentUser,
    isCoachOrAdmin,
  };
}
