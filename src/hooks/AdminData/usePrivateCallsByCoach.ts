import type { PrivateCallData } from 'src/components/AdminDashboard/CallsByCoach/PrivateCallsByCoach/types';
import { useQuery } from '@tanstack/react-query';
// import { useBackendHelpers } from '../useBackend';
export default function usePrivateCallsByCoach() {
  // const { getFactory } = useBackendHelpers();

  const getPrivateCallsByCoach = (): Promise<PrivateCallData[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<PrivateCallData[]>('admin/report/private-calls-by-coach');
  };

  const privateCallsByCoachQuery = useQuery({
    queryKey: ['private-calls-by-coach'],
    queryFn: getPrivateCallsByCoach,
    staleTime: Infinity,
  });

  return { privateCallsByCoachQuery };
}
