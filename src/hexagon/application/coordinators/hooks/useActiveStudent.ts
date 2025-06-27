import type { AppUser } from '@LearnCraft-Spanish/shared/dist/domain/appUser/core-types';
import type { UseActiveStudentReturnType } from './types';
import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { roleHasChangedResponseSchema } from '@LearnCraft-Spanish/shared';
import { useQuery } from '@tanstack/react-query';
import { use, useCallback, useMemo } from 'react';
import { z } from 'zod';

export function useActiveStudent(): UseActiveStudentReturnType {
  const context = use(ActiveStudentContext);
  if (!context) {
    throw new Error(
      'useActiveStudent must be used within an ActiveStudentProvider',
    );
  }
  const { studentSelectionState, updateSelectedStudent } = context;
  const { authUser, logout } = useAuthAdapter();
  const { getAppUserByEmail, getMyData } = useAppUserAdapter();

  const hasUserMadeSelection = useMemo(
    () => studentSelectionState.changed,
    [studentSelectionState],
  );

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
        updateSelectedStudent({
          email: null,
          changed: true,
        });
        return;
      }
      const parsedEmail = z.string().email().safeParse(newEmail);
      if (parsedEmail.success) {
        updateSelectedStudent({
          email: parsedEmail.data,
          changed: true,
        });
      } else {
        console.error('Invalid email', parsedEmail.error);
      }
    },
    [canChangeStudent, updateSelectedStudent],
  );

  const userToFetch: string | null = useMemo(() => {
    // If user has made any selection, use the context value (even if null)
    if (hasUserMadeSelection) {
      return studentSelectionState.email;
    }
    // Otherwise, use current user's email
    return authUser?.email || null;
  }, [hasUserMadeSelection, studentSelectionState.email, authUser]);

  const isOwnUser = useMemo(
    () => userToFetch === authUser?.email,
    [userToFetch, authUser],
  );

  const userFetchFunction = useCallback(async (): Promise<AppUser | null> => {
    if (isOwnUser) {
      const myData = await getMyData();
      if (myData === roleHasChangedResponseSchema.value) {
        logout();
        return null;
      } else {
        return myData;
      }
    }
    return getAppUserByEmail(userToFetch!);
  }, [isOwnUser, getAppUserByEmail, getMyData, userToFetch, logout]);

  const {
    data: appUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appUser', userToFetch],
    queryFn: userFetchFunction,
    enabled: !!userToFetch,
  });

  const returnValue = useMemo(
    (): UseActiveStudentReturnType => ({
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
