import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';

export default function useActiveStudents({
  startDate,
  endDate,
}: {
  startDate: string | undefined;
  endDate: string | undefined;
}) {
  const { isAdmin, isCoach } = useAuthAdapter();

  const { getActiveStudents } = useBackend();

  const activeStudentsQuery = useQuery({
    queryKey: ['activeStudents', { startDate, endDate }],
    queryFn: getActiveStudents,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return {
    activeStudentsQuery,
  };
}
