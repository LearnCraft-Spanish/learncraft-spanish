import { useMemo } from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useProgramsTableQueries from 'src/hooks/VocabQuizDbData/useProgramsTable';

export default function useProgramsTable() {
  const { programsTableQuery } = useProgramsTableQueries();
  const { contextual } = useContextualMenu();

  const programToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-program-')) {
      return null;
    }

    const recordId = Number(contextual.split('edit-program-')[1]);
    return programsTableQuery.data?.find(
      (program) => program.recordId === recordId,
    );
  }, [programsTableQuery.data, contextual]);

  return {
    programToEdit,
    programsTableQuery,
    states: {
      isLoading: programsTableQuery.isLoading,
      isError: programsTableQuery.isError,
      isSuccess: programsTableQuery.isSuccess,
    },
  };
}
