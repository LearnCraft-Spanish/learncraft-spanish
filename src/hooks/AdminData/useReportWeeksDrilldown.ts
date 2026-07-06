import type { CoachSummaryDrilldownData } from 'src/components/AdminDashboard/WeeklyCoachSummaries/types';
import { useQuery } from '@tanstack/react-query';
import { deprecatedAdminReportQueryOptions } from './deprecatedAdminReportQueryOptions';
// import { useBackendHelpers } from '../useBackend';

export default function useReportWeeksDrilldown(
  coachId: string,
  report: string,
) {
  // const { getFactory } = useBackendHelpers();

  const getReportWeeksDrilldown = async (
    _coachId: string,
    _report: string,
  ): Promise<CoachSummaryDrilldownData[]> => {
    throw new Error('This feature is not available at this time.');
    // const formattedCoachId = _coachId.replace(' ', '+');
    // const formattedReportName = _report.replace(' ', '+');
    // return getFactory<CoachSummaryDrilldownData[]>(`admin/weeks-report-drilldown?coachId=${formattedCoachId}&report=${formattedReportName}`);
  };

  const reportWeeksDrilldownQuery = useQuery({
    queryKey: ['weeks-report-drilldown', coachId, report],
    queryFn: () => getReportWeeksDrilldown(coachId, report),
    // staleTime: Infinity,
    ...deprecatedAdminReportQueryOptions,
  });

  return {
    reportWeeksDrilldownQuery,
  };
}
