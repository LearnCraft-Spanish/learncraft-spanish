import { useActiveMembershipsReportQuery } from '@application/queries/AdminReportQueries/useActiveMembershipsReportQuery';

export default function useActiveMembershipsReport() {
  const { activeMembershipsReportQuery } = useActiveMembershipsReportQuery();

  return { activeMembershipsReportQuery };
}
