import { useMemo } from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import useQuizGroupsTableQueries from 'src/hooks/VocabQuizDbData/useQuizGroupsTable';

export default function useQuizGroupsTable() {
  const { contextual } = useContextualMenu();

  const {
    quizGroupsTableQuery,
    createQuizGroupMutation,
    updateQuizGroupMutation,
  } = useQuizGroupsTableQueries();

  const quizGroupToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-quiz-group-')) {
      return null;
    }
    const recordId = Number(contextual.split('edit-quiz-group-')[1]);
    return quizGroupsTableQuery.data?.find(
      (quizGroup) => quizGroup.recordId === recordId,
    );
  }, [quizGroupsTableQuery.data, contextual]);

  const states = {
    isLoading: quizGroupsTableQuery.isLoading,
    isError: quizGroupsTableQuery.isError,
    isSuccess: quizGroupsTableQuery.isSuccess,
  };

  return {
    quizGroupToEdit,
    createQuizGroup: contextual === 'create-quiz-group',
    quizGroupsTableQuery,
    states,
    createQuizGroupMutation,
    updateQuizGroupMutation,
  };
}
