import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';

export default function useCourseList() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  const courseListQuery = useQuery({
    queryKey: ['courseList'],
    queryFn: backend.getCourseList,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  return {
    courseListQuery,
  };
}
