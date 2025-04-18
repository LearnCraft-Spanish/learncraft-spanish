import useReportDrilldown from 'src/hooks/AdminData/useReportDrilldown';

export default function useDrilldownTable(coachId: string, report: string) {
  const { reportDrilldownQuery } = useReportDrilldown(coachId, report);
  const { data, isLoading, isError, isSuccess } = reportDrilldownQuery;
  return {
    data,
    isLoading,
    isError,
    isSuccess,
  };
}
