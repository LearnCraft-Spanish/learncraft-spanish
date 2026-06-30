import type { GroupCallData } from 'src/components/AdminDashboard/CallsByCoach/GroupCallsByCoach/types';
import type { PrivateCallData } from 'src/components/AdminDashboard/CallsByCoach/PrivateCallsByCoach/types';
import { useQuery } from '@tanstack/react-query';
import { deprecatedAdminReportQueryOptions } from './deprecatedAdminReportQueryOptions';
// import { useBackendHelpers } from '../useBackend';

export default function useReportCallsDrilldown(
  coachId: string,
  report: string,
) {
  // const { getFactory } = useBackendHelpers();

  const getReportCallsDrilldown = async (
    _coachId: string,
    _report: string,
  ): Promise<GroupCallData[] | PrivateCallData[]> => {
    throw new Error('This feature is not available at this time.');
    // const formattedCoachId = _coachId.replace(' ', '+');
    // const formattedReportName = _report.replace(' ', '+');
    // return getFactory<GroupCallData[] | PrivateCallData[]>(`admin/calls-report-drilldown?coachId=${formattedCoachId}&report=${formattedReportName}`);
  };

  const reportCallsDrilldownQuery = useQuery({
    queryKey: ['calls-report-drilldown', coachId, report],
    queryFn: () => getReportCallsDrilldown(coachId, report),
    // staleTime: Infinity,
    ...deprecatedAdminReportQueryOptions,
  });

  return {
    reportCallsDrilldownQuery,
  };
}
