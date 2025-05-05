import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';

export default function useActiveStudents({
  startDate,
  endDate,
}: {
  startDate: string | undefined;
  endDate: string | undefined;
}) {
  const userDataQuery = useUserData();

  const { getActiveStudents } = useBackend();

  const activeStudentsQuery = useQuery({
    queryKey: ['activeStudents', { startDate, endDate }],
    queryFn: getActiveStudents,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  return {
    activeStudentsQuery,
  };
}
