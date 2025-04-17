// import type { AssignmentsCompletedByWeekData } from 'src/components/AdminDashboard/AssignmentsCompletedByWeek/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useAssignmentsCompletedByWeek() {
  const { getFactory } = useBackendHelpers();
  const getAssignmentsCompletedByWeek = () => {
    return getFactory<any[]>('admin/report/assignments-completed-by-week');
  };

  const assignmentsCompletedByWeekQuery = useQuery({
    queryKey: ['assignments-completed-by-week'],
    queryFn: getAssignmentsCompletedByWeek,
    staleTime: Infinity,
  });

  return { assignmentsCompletedByWeekQuery };
}
