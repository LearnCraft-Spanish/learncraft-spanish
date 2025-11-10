import type { CoachStudentData } from 'src/components/AdminDashboard/StudentsBySalariedCoach/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useCurrentStudentsBySalariedCoach() {
  const { getFactory } = useBackendHelpers();

  const getCurrentStudentsBySalariedCoach = () => {
    return getFactory<CoachStudentData[]>(
      'admin/report/by-salaried-coach-current',
    );
  };

  const currentStudentsBySalariedCoachQuery = useQuery({
    queryKey: ['current-students-by-salaried-coach'],
    queryFn: getCurrentStudentsBySalariedCoach,
    staleTime: Infinity,
  });

  return { currentStudentsBySalariedCoachQuery };
}
