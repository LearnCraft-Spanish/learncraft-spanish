import type { CoachStudentData } from 'src/components/AdminDashboard/StudentsBySalariedCoach/types';
import { useQuery } from '@tanstack/react-query';
import { deprecatedAdminReportQueryOptions } from './deprecatedAdminReportQueryOptions';
// import { useBackendHelpers } from '../useBackend';

export default function useCurrentStudentsBySalariedCoach() {
  // const { getFactory } = useBackendHelpers();

  const getCurrentStudentsBySalariedCoach = (): Promise<CoachStudentData[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<CoachStudentData[]>('admin/report/by-salaried-coach-current');
  };

  const currentStudentsBySalariedCoachQuery = useQuery({
    queryKey: ['current-students-by-salaried-coach'],
    queryFn: getCurrentStudentsBySalariedCoach,
    // staleTime: Infinity,
    ...deprecatedAdminReportQueryOptions,
  });

  return { currentStudentsBySalariedCoachQuery };
}
