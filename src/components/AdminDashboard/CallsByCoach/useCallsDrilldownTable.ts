import useReportCallsDrilldown from 'src/hooks/AdminData/useReportCallsDrilldown';

export default function useCallsDrilldownTable(
  coachId: string,
  report: string,
) {
  const { reportCallsDrilldownQuery } = useReportCallsDrilldown(
    coachId,
    report,
  );
  const { data, isLoading, isError, isSuccess } = reportCallsDrilldownQuery;
  return {
    data,
    isLoading,
    isError,
    isSuccess,
  };
}
