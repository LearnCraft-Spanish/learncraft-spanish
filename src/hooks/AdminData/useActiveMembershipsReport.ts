import type { ActiveMembershipData } from 'src/components/AdminDashboard/ActiveMemberships/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useActiveMembershipsReport() {
  const { getFactory } = useBackendHelpers();
  const getActiveMembershipsReport = () => {
    return getFactory<ActiveMembershipData[]>(
      'admin/report/active-memberships',
    );
  };

  return useQuery({
    queryKey: ['active-memberships-report'],
    queryFn: getActiveMembershipsReport,
  });
}
