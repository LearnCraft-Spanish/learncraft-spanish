import type { MembershipReportData } from 'src/components/AdminDashboard/ActiveMemberships/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';
export default function useDropoutsByLevelReport() {
  const { getFactory } = useBackendHelpers();
  const getDropoutsByLevelReport = () => {
    return getFactory<MembershipReportData[]>('admin/report/dropouts-by-level');
  };

  const dropoutsByLevelReportQuery = useQuery({
    queryKey: ['dropouts-by-level-report'],
    queryFn: getDropoutsByLevelReport,
    staleTime: Infinity,
  });

  return { dropoutsByLevelReportQuery };
}
