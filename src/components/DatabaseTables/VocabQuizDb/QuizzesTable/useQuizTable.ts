import { useMemo } from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useQuizzesTable from 'src/hooks/VocabQuizDbData/useQuizzesTable';
export default function useQuizTable() {
  const { contextual } = useContextualMenu();

  const { quizzesTableQuery, createQuizMutation, updateQuizMutation } =
    useQuizzesTable();

  const quizToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-quiz-')) {
      return null;
    }
    const recordId = Number(contextual.split('edit-quiz-')[1]);
    return quizzesTableQuery.data?.find((quiz) => quiz.recordId === recordId);
  }, [quizzesTableQuery.data, contextual]);

  const states = {
    isLoading: quizzesTableQuery.isLoading,
    isError: quizzesTableQuery.isError,
    isSuccess: quizzesTableQuery.isSuccess,
  };

  return {
    quizToEdit,
    createQuiz: contextual === 'create-quiz',
    quizTableQuery: quizzesTableQuery,
    states,
    createQuizMutation,
    updateQuizMutation,
  };
}
