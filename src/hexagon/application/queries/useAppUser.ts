import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppUserAdapter } from '../adapters/appUserAdapter';
import { useAuthAdapter } from '../adapters/authAdapter';

export function useAppUser(email: string) {
  const appUserAdapter = useAppUserAdapter();

  /**
   * Before the first fetch, appUser is undefined.
   * If the fetch succeeds but no data is found (no student record, i.e. a coach), appUser is null.
   * If the fetch succeeds and data is found, appUser is the AppUser object.
   */
  const {
    data: appUser,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ['appUser', email],
    queryFn: () => appUserAdapter.getAppUserByEmail(email),
    enabled: !!email,
  });

  return { appUser, isLoading, isError, isSuccess, error };
}

export function useAppStudentList() {
  const appUserAdapter = useAppUserAdapter();
  const { authUser } = useAuthAdapter();

  const isEnabled = useMemo(
    () => authUser.roles.includes('Coach') || authUser.roles.includes('Admin'),
    [authUser.roles],
  );

  const {
    data: appStudentList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appStudentList'],
    queryFn: () => appUserAdapter.getAllAppStudents(),
    enabled: isEnabled,
  });

  return { appStudentList, isLoading, error };
}
