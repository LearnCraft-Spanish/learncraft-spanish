import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

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
