import type { ActiveMembershipData } from 'src/components/AdminDashboard/ActiveMemberships/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';
export default function useDropoutsByLevelReport() {
  const { getFactory } = useBackendHelpers();
  const getDropoutsByLevelReport = () => {
    return getFactory<ActiveMembershipData[]>('admin/report/dropouts-by-level');
  };

  return useQuery({
    queryKey: ['dropouts-by-level-report'],
    queryFn: getDropoutsByLevelReport,
  });
}
