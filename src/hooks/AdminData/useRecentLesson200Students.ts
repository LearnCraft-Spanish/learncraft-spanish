import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useRecentLesson200Students() {
  const { getFactory } = useBackendHelpers();

  const getRecentLesson200Students = () => {
    return getFactory<any>('admin/report/recent-lesson-200-students');
  };

  const recentLesson200StudentsQuery = useQuery({
    queryKey: ['recent-lesson-200-students'],
    queryFn: getRecentLesson200Students,
    staleTime: Infinity,
  });

  return { recentLesson200StudentsQuery };
}
