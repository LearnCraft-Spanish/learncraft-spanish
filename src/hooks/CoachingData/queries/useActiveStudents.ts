import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';

export default function useActiveStudents() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  const activeStudentsQuery = useQuery({
    queryKey: ['activeStudents'],
    queryFn: backend.getActiveStudents,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  return {
    activeStudentsQuery,
  };
}
