import type { MembershipReportData } from 'src/components/AdminDashboard/ActiveMemberships/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useActiveMembershipsReport() {
  const { getFactory } = useBackendHelpers();

  const getActiveMembershipsReport = () => {
    return getFactory<MembershipReportData[]>(
      'admin/report/active-memberships',
    );
  };

  const activeMembershipsReportQuery = useQuery({
    queryKey: ['active-memberships-report'],
    queryFn: getActiveMembershipsReport,
    staleTime: Infinity,
  });

  return { activeMembershipsReportQuery };
}
