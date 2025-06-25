import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppUserAdapter } from '../adapters/appUserAdapter';
import { useAuthAdapter } from '../adapters/authAdapter';

export function useAppStudentList() {
  const appUserAdapter = useAppUserAdapter();
  const { authUser } = useAuthAdapter();

  const isEnabled = useMemo(() => {
    if (!authUser) return false;
    return authUser.roles.includes('Coach') || authUser.roles.includes('Admin');
  }, [authUser]);

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
