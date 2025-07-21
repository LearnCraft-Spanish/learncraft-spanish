import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';

export default function useStudentRecordsLessons() {
  const { isAdmin, isCoach } = useAuthAdapter();
  const backend = useBackend();

  const studentRecordsLessonsQuery = useQuery({
    queryKey: ['studentRecordsLessons'],
    queryFn: backend.getLessonList,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return {
    studentRecordsLessonsQuery,
  };
}
