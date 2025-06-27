import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';

export default function useActiveMemberships({
  startDate,
  endDate,
}: {
  startDate: string | undefined;
  endDate: string | undefined;
}) {
  const { isAdmin, isCoach } = useAuthAdapter();
  const { getActiveMemberships } = useBackend();

  const activeMembershipsQuery = useQuery({
    queryKey: ['activeMemberships', { startDate, endDate }],
    queryFn: getActiveMemberships,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return {
    activeMembershipsQuery,
  };
}
