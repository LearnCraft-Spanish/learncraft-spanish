import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';

export default function useActiveMemberships() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  const activeMembershipsQuery = useQuery({
    queryKey: ['activeMemberships'],
    queryFn: backend.getActiveMemberships,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  return {
    activeMembershipsQuery,
  };
}
