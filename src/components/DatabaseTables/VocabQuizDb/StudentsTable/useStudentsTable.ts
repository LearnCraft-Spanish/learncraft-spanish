import { useAllCoursesQuery } from '@application/queries/useAllCoursesQuery';
import { useStudentsQuery } from '@application/queries/useStudentsQuery';
import { useMemo } from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function useStudentsTable() {
  const { studentsQuery, createStudentMutation, updateStudentMutation } =
    useStudentsQuery();
  const programTableQuery = useAllCoursesQuery();
  const { contextual } = useContextualMenu();

  const studentToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-student-')) {
      return null;
    }

    const recordId = Number(contextual.split('edit-student-')[1]);
    return studentsQuery.data?.find((student) => student.recordId === recordId);
  }, [studentsQuery.data, contextual]);

  return {
    studentToEdit,
    programTableQuery,
    studentsTableQuery: studentsQuery,
    createStudentMutation,
    updateStudentMutation,
    states: {
      isLoading: studentsQuery.isLoading,
      isError: studentsQuery.isError,
      isSuccess: studentsQuery.isSuccess,
    },
    createStudent: contextual === 'create-student',
  };
}
