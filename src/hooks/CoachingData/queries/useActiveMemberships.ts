import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';

export default function useActiveMemberships({
  startDate,
  endDate,
}: {
  startDate: string | undefined;
  endDate: string | undefined;
}) {
  const userDataQuery = useUserData();
  const { getActiveMemberships } = useBackend();

  const activeMembershipsQuery = useQuery({
    queryKey: ['activeMemberships', { startDate, endDate }],
    queryFn: getActiveMemberships,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  return {
    activeMembershipsQuery,
  };
}
