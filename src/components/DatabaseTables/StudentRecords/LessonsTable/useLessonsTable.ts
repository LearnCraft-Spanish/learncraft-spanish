import { useMemo } from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import useLessonsTableQueries from 'src/hooks/StudentRecordsData/useLessonsTable';

export default function useLessonsTable() {
  const { lessonsTableQuery } = useLessonsTableQueries();
  const { contextual } = useContextualMenu();

  const lessonToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-lesson-')) {
      return null;
    }

    const recordId = Number(contextual.split('edit-lesson-')[1]);
    return lessonsTableQuery.data?.find(
      (lesson) => lesson.recordId === recordId,
    );
  }, [lessonsTableQuery.data, contextual]);

  return {
    lessonToEdit,
    lessonsTableQuery,
    states: {
      isLoading: lessonsTableQuery.isLoading,
      isError: lessonsTableQuery.isError,
      isSuccess: lessonsTableQuery.isSuccess,
    },
    createLesson: contextual === 'create-lesson',
  };
}
