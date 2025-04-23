import type { GroupCallData } from 'src/components/AdminDashboard/CallsByCoach/GroupCallsByCoach/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';
export default function useGroupCallsByCoach() {
  const { getFactory } = useBackendHelpers();
  const getGroupCallsByCoach = () => {
    return getFactory<GroupCallData[]>('admin/report/group-calls-by-coach');
  };

  const groupCallsByCoachQuery = useQuery({
    queryKey: ['group-calls-by-coach'],
    queryFn: getGroupCallsByCoach,
    staleTime: Infinity,
  });

  return { groupCallsByCoachQuery };
}
