import { useQuery } from '@tanstack/react-query';
import useStudentDeepDiveBackend from './BackendFunctions';

export default function useStudentMemberships(studentId: number) {
  const { getStudentMemberships } = useStudentDeepDiveBackend();

  return useQuery({
    queryKey: ['studentMemberships', studentId],
    queryFn: () => getStudentMemberships(studentId),
    staleTime: Infinity,
  });
}
