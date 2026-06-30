import type { MembershipReportData } from 'src/components/AdminDashboard/ActiveMemberships/types';
import { useQuery } from '@tanstack/react-query';
import { deprecatedAdminReportQueryOptions } from './deprecatedAdminReportQueryOptions';
// import { useBackendHelpers } from '../useBackend';

export default function useActiveMembershipsReport() {
  // const { getFactory } = useBackendHelpers();

  const getActiveMembershipsReport = (): Promise<MembershipReportData[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<MembershipReportData[]>('admin/report/active-memberships');
  };

  const activeMembershipsReportQuery = useQuery({
    queryKey: ['active-memberships-report'],
    queryFn: getActiveMembershipsReport,
    // staleTime: Infinity,
    ...deprecatedAdminReportQueryOptions,
  });

  return { activeMembershipsReportQuery };
}
