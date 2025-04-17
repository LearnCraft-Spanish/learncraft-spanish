import type { WeeklyCoachSummaryData } from 'src/components/AdminDashboard/WeeklyCoachSummary/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useWeeklyCoachSummary() {
  const { getFactory } = useBackendHelpers();
  const getWeeklyCoachSummary = () => {
    return getFactory<WeeklyCoachSummaryData[]>(
      'admin/report/weekly-coach-summary',
    );
  };

  return useQuery({
    queryKey: ['weekly-coach-summary'],
    queryFn: getWeeklyCoachSummary,
    staleTime: Infinity,
  });
}
