import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useStudentsBeyond150ByCoach(
  coachId: number | undefined,
) {
  const { getFactory } = useBackendHelpers();
  const routeTemplate = 'coaching/students-beyond-150-by-coach/:coachId';

  const getStudentsBeyond150ByCoach = () => {
    if (!coachId) return [];
    return getFactory<any>(
      routeTemplate.replace(':coachId', coachId.toString()),
    );
  };

  const studentsBeyond150ByCoachQuery = useQuery({
    queryKey: ['students-beyond-150-by-coach', coachId],
    queryFn: getStudentsBeyond150ByCoach,
    staleTime: Infinity,
    enabled: !!coachId,
  });

  return { studentsBeyond150ByCoachQuery };
}
