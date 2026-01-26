import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useFlashcardsQuery } from '@application/queries/useFlashcardsQuery';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useQuizExampleMutations } from '@application/queries/useQuizExampleMutations';
import { useQuizExamplesQuery } from '@application/queries/useQuizExamplesQuery';
import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';

export type AssignmentType = 'students' | 'quiz';

export interface UseExampleAssignerReturn {
  // Assignment type state
  assignmentType: AssignmentType;
  setAssignmentType: (type: AssignmentType) => void;
  toggleAssignmentType: () => void;

  // Quiz selection state
  selectedCourseCode: string;
  setSelectedCourseCode: (code: string) => void;
  selectedQuizRecordId: number | undefined;
  setSelectedQuizRecordId: (id: number | undefined) => void;
  selectedQuizRecord:
    | {
        courseCode: string;
        quizNumber: number;
        recordId: number;
        quizNickname?: string;
      }
    | undefined;

  // Available quizzes filtered by course
  availableQuizzes:
    | Array<{
        recordId: number;
        quizNickname?: string;
        quizNumber?: number;
        courseCode: string;
      }>
    | undefined;

  // Selected examples to assign
  selectedExamples: ExampleWithVocabulary[];
  isFetchingSelectedExamples: boolean;

  // Assigned examples (existing data)
  assignedExamples: ExampleWithVocabulary[] | undefined;
  isLoadingAssignedExamples: boolean;
  assignedExamplesError: Error | null;

  // Active student (for student assignment)
  activeStudent: { recordId: number; name: string } | null;
  isLoadingActiveStudent: boolean;

  // Mutations
  assignExamples: () => Promise<void>;
  isAssigning: boolean;
  assigningError: Error | null;

  // Course options for quiz selection
  courseOptions: Array<{ code: string; name: string }>;
}

export function useExampleAssigner(): UseExampleAssignerReturn {
  // Assignment type state
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>('students');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('none');
  const [selectedQuizRecordId, setSelectedQuizRecordId] = useState<
    number | undefined
  >(undefined);

  // Get selected examples
  const { selectedExamples, isFetchingExamples } = useSelectedExamples();
  const isFetchingSelectedExamples = isFetchingExamples > 0;

  // Get active student
  const { appUser, isLoading: isLoadingActiveStudent } = useActiveStudent();

  // Get official quizzes
  const { officialQuizRecords, isLoading: isLoadingQuizzes } =
    useOfficialQuizzesQuery();

  // Filter quizzes by selected course
  const availableQuizzes = useMemo(() => {
    if (!officialQuizRecords || selectedCourseCode === 'none') return undefined;

    return officialQuizRecords
      .filter((quiz) => quiz.courseCode === selectedCourseCode)
      .map((quiz) => ({
        recordId: quiz.id,
        quizNickname: quiz.quizTitle,
        quizNumber: quiz.quizNumber,
        courseCode: quiz.courseCode,
      }));
  }, [officialQuizRecords, selectedCourseCode]);

  // Get selected quiz record
  const selectedQuizRecord = useMemo(() => {
    if (
      assignmentType !== 'quiz' ||
      !selectedCourseCode ||
      selectedCourseCode === 'none' ||
      !selectedQuizRecordId ||
      !availableQuizzes
    ) {
      return undefined;
    }

    const quiz = availableQuizzes.find(
      (q) => q.recordId === selectedQuizRecordId,
    );
    if (!quiz || !quiz.quizNumber) return undefined;

    return {
      courseCode: quiz.courseCode,
      quizNumber: quiz.quizNumber,
      recordId: quiz.recordId,
      quizNickname: quiz.quizNickname,
    };
  }, [
    assignmentType,
    selectedCourseCode,
    selectedQuizRecordId,
    availableQuizzes,
  ]);

  // Conditional queries based on assignment type
  const {
    flashcards,
    isLoading: isLoadingFlashcards,
    error: flashcardsError,
  } = useFlashcardsQuery();

  const {
    quizExamples,
    isLoading: isLoadingQuizExamples,
    error: quizExamplesError,
  } = useQuizExamplesQuery({
    courseCode: selectedQuizRecord?.courseCode || '',
    quizNumber: selectedQuizRecord?.quizNumber || 0,
  });

  // Determine assigned examples based on assignment type
  const assignedExamples = useMemo(() => {
    if (assignmentType === 'students' && flashcards) {
      // Convert flashcards to examples
      return flashcards.map((flashcard) => flashcard.example);
    } else if (assignmentType === 'quiz' && quizExamples) {
      return quizExamples;
    }
    return undefined;
  }, [assignmentType, flashcards, quizExamples]);

  const isLoadingAssignedExamples =
    assignmentType === 'students'
      ? isLoadingFlashcards
      : isLoadingQuizExamples || isLoadingQuizzes;

  const assignedExamplesError =
    assignmentType === 'students' ? flashcardsError : quizExamplesError;

  // Mutations
  const { addExamplesToQuiz, isAddingExamples, addingExamplesError } =
    useQuizExampleMutations();
  const { createFlashcards } = useFlashcardsQuery();

  // Assignment function
  const assignExamples = useCallback(async () => {
    if (selectedExamples.length === 0) {
      throw new Error('No examples selected');
    }

    if (assignmentType === 'students') {
      if (!appUser?.recordId) {
        throw new Error('No active student selected');
      }
      await createFlashcards(selectedExamples);
    } else if (assignmentType === 'quiz') {
      if (!selectedQuizRecord) {
        throw new Error('No quiz selected');
      }
      const exampleIds = selectedExamples.map((ex) => ex.id);
      await addExamplesToQuiz({
        courseCode: selectedQuizRecord.courseCode,
        quizNumber: selectedQuizRecord.quizNumber,
        exampleIds,
      });
    }
  }, [
    selectedExamples,
    assignmentType,
    appUser?.recordId,
    selectedQuizRecord,
    createFlashcards,
    addExamplesToQuiz,
  ]);

  const toggleAssignmentType = useCallback(() => {
    setAssignmentType((prev) => (prev === 'students' ? 'quiz' : 'students'));
    // Reset quiz selection when switching
    setSelectedCourseCode('none');
    setSelectedQuizRecordId(undefined);
  }, []);

  const courseOptions = officialQuizCourses;

  return {
    // Assignment type state
    assignmentType,
    setAssignmentType,
    toggleAssignmentType,

    // Quiz selection state
    selectedCourseCode,
    setSelectedCourseCode,
    selectedQuizRecordId,
    setSelectedQuizRecordId,
    selectedQuizRecord,

    // Available quizzes
    availableQuizzes,

    // Selected examples
    selectedExamples,
    isFetchingSelectedExamples,

    // Assigned examples
    assignedExamples,
    isLoadingAssignedExamples,
    assignedExamplesError,

    // Active student
    activeStudent: appUser
      ? { recordId: appUser.recordId, name: appUser.name }
      : null,
    isLoadingActiveStudent,

    // Mutations
    assignExamples,
    isAssigning: isAddingExamples,
    assigningError: addingExamplesError,

    // Course options
    courseOptions,
  };
}
