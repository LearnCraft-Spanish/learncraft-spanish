import useReportWeeksDrilldown from 'src/hooks/AdminData/useReportWeeksDrilldown';

export default function useWeeksDrilldownTable(
  coachId: string,
  report: string,
) {
  const { reportWeeksDrilldownQuery } = useReportWeeksDrilldown(
    coachId,
    report,
  );
  const { data, isLoading, isError, isSuccess } = reportWeeksDrilldownQuery;
  return {
    data,
    isLoading,
    isError,
    isSuccess,
  };
}
