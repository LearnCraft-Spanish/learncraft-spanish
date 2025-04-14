import type { EditableProgram } from 'src/components/DatabaseTables/components/VocabQuizDb/ProgramsTable/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../useBackend';
import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useProgramsTable() {
  const { getProgramsTable } = useVocabQuizDbBackend();
  const { newPutFactory } = useBackendHelpers();

  const programsTableQuery = useQuery({
    queryKey: ['programs-table'],
    queryFn: getProgramsTable,
    staleTime: Infinity,
  });

  const updateProgramMutation = useMutation({
    mutationFn: (program: EditableProgram) => {
      const promise = newPutFactory<EditableProgram>({
        path: 'vocab-quiz/programs',
        body: program,
      });
      toast.promise(promise, {
        pending: 'Updating program...',
        success: 'Program updated successfully!',
        error: 'Failed to update program',
      });
      return promise;
    },
    onSuccess: () => {
      programsTableQuery.refetch();
    },
  });

  const updateManyProgramsMutation = useMutation({
    mutationFn: (programs: EditableProgram[]) => {
      const promise = newPutFactory<number[]>({
        path: 'vocab-quiz/programs/bulk-update',
        body: programs,
      });
      toast.promise(promise, {
        pending: 'Updating programs...',
        success: 'Programs updated successfully!',
        error: 'Failed to update programs',
      });
      return promise;
    },
    onSuccess: () => {
      programsTableQuery.refetch();
    },
  });

  return {
    programsTableQuery,
    updateProgramMutation,
    updateManyProgramsMutation,
  };
}
