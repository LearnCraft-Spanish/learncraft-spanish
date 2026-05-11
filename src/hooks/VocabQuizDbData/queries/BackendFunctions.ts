import type {
  AdminQuizGroup,
  AdminQuizRecord,
} from '@learncraft-spanish/shared';
import type { Lesson } from 'src/types/DatabaseTables';
import type { FlashcardStudent } from 'src/types/interfaceDefinitions';
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

  // get quizzes table (admin — migrated from vocab-quiz/quizzes)
  const getQuizzesTable = () => {
    return getFactory<AdminQuizRecord[]>('admin/quizzes');
  };

  // get quiz groups table (admin — migrated from vocab-quiz/quiz-groups)
  const getQuizGroupsTable = () => {
    return getFactory<AdminQuizGroup[]>('admin/quiz-groups');
  };

  // get vocab-quiz db lessons table
  const getVqdLessonsTable = () => {
    return getFactory<Lesson[]>('vocab-quiz/lessons');
  };

  return {
    getStudentsTable,
    getStudentsTableCohortFieldOptions,
    getQuizzesTable,
    getQuizGroupsTable,
    getVqdLessonsTable,
  };
}
