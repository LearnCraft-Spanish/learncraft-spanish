// used in Coaching interfaces

import type {
  NewQuizGroup,
  QuizGroupObjForUpdate,
} from 'src/components/DatabaseTables/VocabQuizDb/QuizGroupsTable/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../useBackend';
import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useQuizGroupsTable() {
  const { getQuizGroupsTable } = useVocabQuizDbBackend();
  const { newPostFactory, newPutFactory } = useBackendHelpers();

  const quizGroupsTableQuery = useQuery({
    queryKey: ['quiz-groups-table'],
    queryFn: getQuizGroupsTable,
    staleTime: Infinity,
  });

  const createQuizGroupMutation = useMutation({
    mutationFn: (quizGroup: NewQuizGroup) => {
      const promise = newPostFactory<NewQuizGroup>({
        path: 'vocab-quiz/quiz-groups',
        body: quizGroup,
      });

      toast.promise(promise, {
        pending: 'Creating quiz group...',
        success: 'Quiz group created successfully',
        error: 'Failed to create quiz group',
      });

      return promise;
    },
    onSuccess: () => {
      quizGroupsTableQuery.refetch();
    },
  });

  const updateQuizGroupMutation = useMutation({
    mutationFn: (quizGroup: QuizGroupObjForUpdate) => {
      const promise = newPutFactory<QuizGroupObjForUpdate>({
        path: 'vocab-quiz/quiz-groups',
        body: quizGroup,
      });

      toast.promise(promise, {
        pending: 'Updating quiz group...',
        success: 'Quiz group updated successfully',
        error: 'Failed to update quiz group',
      });

      return promise;
    },
    onSuccess: () => {
      quizGroupsTableQuery.refetch();
    },
  });

  return {
    quizGroupsTableQuery,
    createQuizGroupMutation,
    updateQuizGroupMutation,
  };
}
