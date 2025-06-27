import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';

export default function useCoachList() {
  const { isAdmin, isCoach } = useAuthAdapter();
  const backend = useBackend();

  const coachListQuery = useQuery({
    queryKey: ['coachList'],
    queryFn: backend.getCoachList,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return {
    coachListQuery,
  };
}
