import { useMemo } from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import useVqdLessonsTableQueries from 'src/hooks/VocabQuizDbData/useVqdLessonsTable';

export default function useVqdLessonsTable() {
  const { contextual } = useContextualMenu();

  const { vqdLessonsTableQuery, createLessonMutation, updateLessonMutation } =
    useVqdLessonsTableQueries();

  const lessonToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-vqd-lesson-')) {
      return null;
    }
    const recordId = Number(contextual.split('edit-vqd-lesson-')[1]);
    return vqdLessonsTableQuery.data?.find(
      (lesson) => lesson.recordId === recordId,
    );
  }, [vqdLessonsTableQuery.data, contextual]);

  const states = {
    isLoading: vqdLessonsTableQuery.isLoading,
    isError: vqdLessonsTableQuery.isError,
    isSuccess: vqdLessonsTableQuery.isSuccess,
  };

  return {
    lessonToEdit,
    createLesson: contextual === 'create-vqd-lesson',
    vqdLessonsTableQuery,
    states,
    createLessonMutation,
    updateLessonMutation,
  };
}
