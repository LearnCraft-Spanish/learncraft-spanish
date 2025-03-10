import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';

export default function useStudentRecordsLessons() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  const studentRecordsLessonsQuery = useQuery({
    queryKey: ['studentRecordsLessons'],
    queryFn: backend.getLessonList,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  return {
    studentRecordsLessonsQuery,
  };
}
