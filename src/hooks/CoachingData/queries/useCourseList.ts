import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';

export default function useCourseList() {
  const { isAdmin, isCoach } = useAuthAdapter();
  const backend = useBackend();

  const courseListQuery = useQuery({
    queryKey: ['courseList'],
    queryFn: backend.getCourseList,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return {
    courseListQuery,
  };
}
