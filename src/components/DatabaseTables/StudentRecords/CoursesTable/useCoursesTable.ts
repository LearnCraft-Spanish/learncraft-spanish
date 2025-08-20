import { useMemo } from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import useCoursesTableQueries from 'src/hooks/StudentRecordsData/useCoursesTable';

export default function useCoursesTable() {
  const { coursesTableQuery } = useCoursesTableQueries();
  const { contextual } = useContextualMenu();

  const courseToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-course-')) {
      return null;
    }

    const recordId = Number(contextual.split('edit-course-')[1]);
    return coursesTableQuery.data?.find(
      (course) => course.recordId === recordId,
    );
  }, [coursesTableQuery.data, contextual]);

  return {
    courseToEdit,
    coursesTableQuery,
    states: {
      isLoading: coursesTableQuery.isLoading,
      isError: coursesTableQuery.isError,
      isSuccess: coursesTableQuery.isSuccess,
    },
    createCourse: contextual === 'create-course',
  };
}
