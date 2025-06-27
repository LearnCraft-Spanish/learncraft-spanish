import { useQuery } from '@tanstack/react-query';
import { useAppUserAdapter } from '../adapters/appUserAdapter';
import { useAuthAdapter } from '../adapters/authAdapter';

export function useAppStudentList() {
  const appUserAdapter = useAppUserAdapter();
  const { isAdmin, isCoach } = useAuthAdapter();

  const {
    data: appStudentList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appStudentList'],
    queryFn: () => appUserAdapter.getAllAppStudents(),
    enabled: isAdmin || isCoach,
  });

  return { appStudentList, isLoading, error };
}
