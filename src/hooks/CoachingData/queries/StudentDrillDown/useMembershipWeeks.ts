import { useQuery } from '@tanstack/react-query';
import useStudentDrillDownBackend from './BackendFunctions';

export default function useMembershipWeeks(membershipId: number) {
  const { getMembershipWeeks } = useStudentDrillDownBackend();

  return useQuery({
    queryKey: ['membershipWeeks', membershipId],
    queryFn: () => getMembershipWeeks(membershipId),
    staleTime: Infinity,
  });
}
