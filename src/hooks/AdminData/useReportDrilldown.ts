import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';
export default function useReportDrilldown(coachId: string, report: string) {
  const { getFactory } = useBackendHelpers();

  const getReportDrilldown = async (coachId: string, report: string) => {
    const formattedCoachId = coachId.replace(' ', '+');
    const formattedReportName = report.replace(' ', '+');
    return getFactory<any[]>(
      `admin/report-drilldown?coachId=${formattedCoachId}&report=${formattedReportName}`,
    );
  };

  const reportDrilldownQuery = useQuery({
    queryKey: ['report-drilldown', coachId, report],
    queryFn: () => getReportDrilldown(coachId, report),
    staleTime: Infinity,
  });

  return {
    getReportDrilldown,
    reportDrilldownQuery,
  };
}
