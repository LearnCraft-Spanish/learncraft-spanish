import type { FlashcardStudent, Program } from 'src/types/interfaceDefinitions';
import { useBackendHelpers } from 'src/hooks/useBackend';

export default function useVocabQuizDbBackend() {
  const { getFactory } = useBackendHelpers();

  // get students table
  const getStudentsTable = () => {
    return getFactory<FlashcardStudent[]>('vocab-quiz/students');
  };

  const getStudentsTableCohortFieldOptions = () => {
    return getFactory<string[]>('vocab-quiz/students/cohort-field-options');
  };

  // get programs table
  const getProgramsTable = () => {
    return getFactory<Program[]>('vocab-quiz/programs');
  };

  return {
    getStudentsTable,
    getStudentsTableCohortFieldOptions,
    getProgramsTable,
  };
}
