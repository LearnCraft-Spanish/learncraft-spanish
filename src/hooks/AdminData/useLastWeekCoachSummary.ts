import type { LastWeekCoachSummaryData } from 'src/components/AdminDashboard/LastWeekCoachSummary/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useLastWeekCoachSummary() {
  const { getFactory } = useBackendHelpers();
  const getLastWeekCoachSummary = () => {
    return getFactory<LastWeekCoachSummaryData[]>(
      'admin/report/last-week-coach-summary',
    );
  };

  return useQuery({
    queryKey: ['last-week-coach-summary'],
    queryFn: getLastWeekCoachSummary,
    staleTime: Infinity,
  });
}
