import type { CoachStudentData } from 'src/components/AdminDashboard/StudentsBySalariedCoach/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useStudentsBySalariedCoach2WeeksOut() {
  const { getFactory } = useBackendHelpers();

  const getStudentsBySalariedCoach2WeeksOut = () => {
    return getFactory<CoachStudentData[]>(
      'admin/report/by-salaried-coach-2-weeks-out',
    );
  };

  const studentsBySalariedCoach2WeeksOutQuery = useQuery({
    queryKey: ['students-by-salaried-coach-2-weeks-out'],
    queryFn: getStudentsBySalariedCoach2WeeksOut,
    staleTime: Infinity,
  });

  return { studentsBySalariedCoach2WeeksOutQuery };
}
