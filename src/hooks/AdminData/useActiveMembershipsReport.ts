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

  const activeMembershipsReportQuery = useQuery({
    queryKey: ['active-memberships-report'],
    queryFn: getActiveMembershipsReport,
    staleTime: Infinity,
  });

  return { activeMembershipsReportQuery };
}

// export function useActiveMembershipsReportByCourse(courseName: string) {
//   const { getFactory } = useBackendHelpers();
//   if (!courseName) {
//     throw new Error('Course name is required');
//   }

//   const getActiveMembershipsReportByCourse = (courseName: string) => {
//     const formattedCourseName = courseName.replace(/\s+/g, '+');
//     return getFactory<ActiveMembershipData[]>(
//       `admin/report/active-memberships-drilldown?courseName=${formattedCourseName}`,
//     );
//   };

//   const activeMembershipsReportByCourseQuery = useQuery({
//     queryKey: ['active-memberships-report-by-course', courseName],
//     queryFn: () => getActiveMembershipsReportByCourse(courseName),
//     staleTime: Infinity,
//   });

//   return { activeMembershipsReportByCourseQuery };
// }
