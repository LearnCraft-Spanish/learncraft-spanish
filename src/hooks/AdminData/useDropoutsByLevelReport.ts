import { useDropoutsByLevelReportQuery } from '@application/queries/AdminReportQueries/useDropoutsByLevelReportQuery';

export default function useDropoutsByLevelReport() {
  const { dropoutsByLevelReportQuery } = useDropoutsByLevelReportQuery();

  return { dropoutsByLevelReportQuery };
}
