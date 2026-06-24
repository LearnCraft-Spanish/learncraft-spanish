import type { CoachSummaryData } from 'src/components/AdminDashboard/WeeklyCoachSummaries/types';
import { useQuery } from '@tanstack/react-query';
// import { useBackendHelpers } from '../useBackend';

export default function useLastWeekCoachSummary() {
  // const { getFactory } = useBackendHelpers();

  const getLastWeekCoachSummary = (): Promise<CoachSummaryData[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<CoachSummaryData[]>('admin/report/last-week-coach-summary');
  };

  const lastWeekCoachSummaryQuery = useQuery({
    queryKey: ['last-week-coach-summary'],
    queryFn: getLastWeekCoachSummary,
    staleTime: Infinity,
  });

  return { lastWeekCoachSummaryQuery };
}
