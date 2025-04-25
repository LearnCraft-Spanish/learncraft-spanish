import type { GroupCallData } from 'src/components/AdminDashboard/CallsByCoach/GroupCallsByCoach/types';
import type { PrivateCallData } from 'src/components/AdminDashboard/CallsByCoach/PrivateCallsByCoach/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useReportCallsDrilldown(
  coachId: string,
  report: string,
) {
  const { getFactory } = useBackendHelpers();

  const getReportCallsDrilldown = async (coachId: string, report: string) => {
    const formattedCoachId = coachId.replace(' ', '+');
    const formattedReportName = report.replace(' ', '+');
    return getFactory<GroupCallData[] | PrivateCallData[]>(
      `admin/calls-report-drilldown?coachId=${formattedCoachId}&report=${formattedReportName}`,
    );
  };

  const reportCallsDrilldownQuery = useQuery({
    queryKey: ['calls-report-drilldown', coachId, report],
    queryFn: () => getReportCallsDrilldown(coachId, report),
    staleTime: Infinity,
  });

  return {
    reportCallsDrilldownQuery,
  };
}
