import type { AppUser } from '@LearnCraft-Spanish/shared/dist/domain/appUser/core-types';
import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { useQuery } from '@tanstack/react-query';
import { use, useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

interface UseActiveStudentReturnType {
  appUser: AppUser | null;
  isLoading: boolean;
  error: Error | null;
  changeActiveStudent: (newEmail: string | null) => void;
}

export function useActiveStudent(): UseActiveStudentReturnType {
  const context = use(ActiveStudentContext);
  if (!context) {
    throw new Error(
      'useActiveStudent must be used within an ActiveStudentProvider',
    );
  }
  const { activeStudentEmail, updateActiveStudentEmail } = context;
  const { authUser } = useAuthAdapter();
  const { getAppUserByEmail, getMyData } = useAppUserAdapter();
  const [hasUserMadeSelection, setHasUserMadeSelection] = useState(false);

  const canChangeStudent = useMemo(() => {
    if (!authUser) return false;
    return authUser.roles.includes('Coach') || authUser.roles.includes('Admin');
  }, [authUser]);

  const changeActiveStudent = useCallback(
    (newEmail: string | null) => {
      if (!canChangeStudent) {
        console.error('User does not have permission to change active student');
        return;
      }
      if (!newEmail) {
        updateActiveStudentEmail(null);
        return;
      }
      const parsedEmail = z.string().email().safeParse(newEmail);
      if (parsedEmail.success) {
        updateActiveStudentEmail(parsedEmail.data);
      } else {
        console.error('Invalid email', parsedEmail.error);
        return;
      }
      setHasUserMadeSelection(true);
    },
    [canChangeStudent, updateActiveStudentEmail],
  );

  const userToFetch: string | null = useMemo(() => {
    if (hasUserMadeSelection) {
      return activeStudentEmail;
    }
    return authUser?.email || null;
  }, [hasUserMadeSelection, activeStudentEmail, authUser]);

  const isOwnUser = useMemo(
    () => userToFetch === authUser?.email,
    [userToFetch, authUser],
  );

  const userFetchFunction = useCallback((): Promise<AppUser | null> => {
    if (isOwnUser) {
      return getMyData();
    }
    return getAppUserByEmail(userToFetch!);
  }, [isOwnUser, getAppUserByEmail, getMyData, userToFetch]);

  const {
    data: appUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appUser', userToFetch],
    queryFn: () => userFetchFunction(),
    enabled: !!userToFetch,
  });

  const returnValue = useMemo(
    () => ({
      appUser: appUser || null,
      isLoading,
      error,
      isOwnUser,
      changeActiveStudent,
    }),
    [appUser, isLoading, error, changeActiveStudent, isOwnUser],
  );
  return returnValue;
}
