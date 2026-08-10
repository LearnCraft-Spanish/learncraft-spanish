import type { UseLeadsToReEngageReportQueryReturn } from '@application/queries/AdminReportQueries/useLeadsToReEngageReportQuery';
import { useLeadsToReEngageReportQuery } from '@application/queries/AdminReportQueries/useLeadsToReEngageReportQuery';

export default function useLeadsToReEngage(): UseLeadsToReEngageReportQueryReturn {
  const { leadsToReEngageReportQuery } = useLeadsToReEngageReportQuery();

  return { leadsToReEngageReportQuery };
}
