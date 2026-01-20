// used in Coaching interfaces

import type {
  NewQuiz,
  QuizObjForUpdate,
} from 'src/components/DatabaseTables/VocabQuizDb/QuizzesTable/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../useBackend';
import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useQuizzesTable() {
  const { getQuizzesTable } = useVocabQuizDbBackend();
  const { newPostFactory, newPutFactory } = useBackendHelpers();

  const quizzesTableQuery = useQuery({
    queryKey: ['quizzes-table'],
    queryFn: getQuizzesTable,
    staleTime: Infinity,
  });

  const createQuizMutation = useMutation({
    mutationFn: (quiz: NewQuiz) => {
      const promise = newPostFactory<NewQuiz>({
        path: 'vocab-quiz/quizzes',
        body: quiz,
      });

      toast.promise(promise, {
        pending: 'Creating quiz...',
        success: 'Quiz created successfully',
        error: 'Failed to create quiz',
      });

      return promise;
    },
    onSuccess: () => {
      quizzesTableQuery.refetch();
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: (quiz: QuizObjForUpdate) => {
      const promise = newPutFactory<QuizObjForUpdate>({
        path: 'vocab-quiz/quizzes',
        body: quiz,
      });

      toast.promise(promise, {
        pending: 'Updating quiz...',
        success: 'Quiz updated successfully',
        error: 'Failed to update quiz',
      });

      return promise;
    },
  });

  return {
    quizzesTableQuery,
    createQuizMutation,
    updateQuizMutation,
  };
}
