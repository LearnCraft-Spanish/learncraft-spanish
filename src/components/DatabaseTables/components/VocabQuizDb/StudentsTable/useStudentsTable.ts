import { useMemo } from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useStudentsTableQueries from 'src/hooks/VocabQuizDbData/useStudentsTable';

export default function useStudentsTable() {
  const { studentsTableQuery, programTableQuery } = useStudentsTableQueries();
  const { contextual } = useContextualMenu();

  const studentToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-student-')) {
      return null;
    }

    const recordId = Number(contextual.split('edit-student-')[1]);
    return studentsTableQuery.data?.find(
      (student) => student.recordId === recordId,
    );
  }, [studentsTableQuery.data, contextual]);

  return {
    studentToEdit,
    programTableQuery,
    studentsTableQuery,
    states: {
      isLoading: studentsTableQuery.isLoading,
      isError: studentsTableQuery.isError,
      isSuccess: studentsTableQuery.isSuccess,
    },
    createStudent: contextual === 'create-student',
  };
}
