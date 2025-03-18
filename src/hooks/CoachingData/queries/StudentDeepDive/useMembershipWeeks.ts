import { useQuery } from '@tanstack/react-query';
import useStudentDeepDiveBackend from './BackendFunctions';

export default function useMembershipWeeks(membershipId: number) {
  const { getMembershipWeeks } = useStudentDeepDiveBackend();

  return useQuery({
    queryKey: ['membershipWeeks', membershipId],
    queryFn: () => getMembershipWeeks(membershipId),
    staleTime: Infinity,
  });
}
