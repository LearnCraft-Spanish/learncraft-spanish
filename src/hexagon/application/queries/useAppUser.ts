import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppUserAdapter } from '../adapters/appUserAdapter';
import { useAuthAdapter } from '../adapters/authAdapter';

export function useAppUser(email: string) {
  const appUserAdapter = useAppUserAdapter();

  const {
    data: appUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appUser', email],
    queryFn: () => appUserAdapter.getAppUserByEmail(email),
    enabled: !!email,
  });

  return { appUser, isLoading, error };
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
