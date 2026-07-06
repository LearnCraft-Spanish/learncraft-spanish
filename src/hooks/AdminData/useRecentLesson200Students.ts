import { useQuery } from '@tanstack/react-query';
import { deprecatedAdminReportQueryOptions } from './deprecatedAdminReportQueryOptions';
// import { useBackendHelpers } from '../useBackend';

export default function useRecentLesson200Students() {
  // const { getFactory } = useBackendHelpers();

  const getRecentLesson200Students = (): Promise<any> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<any>('admin/report/recent-lesson-200-students');
  };

  const recentLesson200StudentsQuery = useQuery({
    queryKey: ['recent-lesson-200-students'],
    queryFn: getRecentLesson200Students,
    // staleTime: Infinity,
    ...deprecatedAdminReportQueryOptions,
  });

  return { recentLesson200StudentsQuery };
}
