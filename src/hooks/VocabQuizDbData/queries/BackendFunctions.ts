import type { Lesson, QbQuiz, QuizGroup } from 'src/types/DatabaseTables';
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

  // get quizzes table
  const getQuizzesTable = () => {
    return getFactory<QbQuiz[]>('vocab-quiz/quizzes');
  };

  // get quiz groups table
  const getQuizGroupsTable = () => {
    return getFactory<QuizGroup[]>('vocab-quiz/quiz-groups');
  };

  // get vocab-quiz db lessons table
  const getVqdLessonsTable = () => {
    return getFactory<Lesson[]>('vocab-quiz/lessons');
  };

  return {
    getStudentsTable,
    getStudentsTableCohortFieldOptions,
    getProgramsTable,
    getQuizzesTable,
    getQuizGroupsTable,
    getVqdLessonsTable,
  };
}
