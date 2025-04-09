import type {
  FlashcardStudent,
  Program,
  Quiz,
} from 'src/types/interfaceDefinitions';
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

  // get quizzes table
  const getQuizzesTable = () => {
    return getFactory<Quiz[]>('vocab-quiz/quizzes');
  };

  return {
    getStudentsTable,
    getStudentsTableCohortFieldOptions,
    getProgramsTable,
    getQuizzesTable,
  };
}
