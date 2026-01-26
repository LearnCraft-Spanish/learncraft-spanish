import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useFlashcardsQuery } from '@application/queries/useFlashcardsQuery';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useQuizExampleMutations } from '@application/queries/useQuizExampleMutations';
import { useQuizExamplesQuery } from '@application/queries/useQuizExamplesQuery';
import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { usePagination } from '@application/units/Pagination/usePagination';
import useLessonPopup from '@application/units/useLessonPopup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';

export type AssignmentType = 'students' | 'quiz';

export interface AssignmentTypeSelectorProps {
  assignmentType: AssignmentType;
  onToggle: () => void;
}

export interface StudentSelectionProps {
  isLoading: boolean;
}

export interface QuizSelectionProps {
  selectedCourseCode: string;
  onCourseCodeChange: (code: string) => void;
  selectedQuizRecordId: number | undefined;
  onQuizRecordIdChange: (id: number | undefined) => void;
  availableQuizzes:
    | Array<{
        recordId: number;
        quizNickname?: string;
        quizNumber?: number;
        courseCode: string;
      }>
    | undefined;
  courseOptions: Array<{ code: string; name: string }>;
}

export interface AssignedStudentFlashcardsProps {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: {
    totalItems: number;
    pageNumber: number;
    maxPageNumber: number;
    startIndex: number;
    endIndex: number;
    pageSize: number;
    isOnFirstPage: boolean;
    isOnLastPage: boolean;
    previousPage: () => void;
    nextPage: () => void;
    goToFirstPage: () => void;
  };
  isLoading: boolean;
  error: Error | null;
  targetName: string;
  onGoingToQuiz: () => void;
}

export interface AssignedQuizExamplesProps {
  examples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
  targetName: string;
  studentFlashcards: UseStudentFlashcardsReturn;
  lessonPopup: LessonPopup;
}

export interface UnassignedExamplesProps {
  examples: ExampleWithVocabulary[];
  studentFlashcards: UseStudentFlashcardsReturn;
  lessonPopup: LessonPopup;
}

export interface AssignButtonProps {
  assignmentType: AssignmentType;
  unassignedCount: number;
  isAssigning: boolean;
  canAssign: boolean;
  activeStudentName?: string | null;
  quizName?: string | null;
  onClick: () => void;
}

export interface UseExampleAssignerReturn {
  // Selected examples to assign
  selectedExamples: ExampleWithVocabulary[];
  isFetchingSelectedExamples: boolean;

  // Props objects for components
  assignmentTypeSelectorProps: AssignmentTypeSelectorProps;
  studentSelectionProps: StudentSelectionProps;
  quizSelectionProps: QuizSelectionProps;
  assignedStudentFlashcardsProps: AssignedStudentFlashcardsProps | undefined;
  assignedQuizExamplesProps: AssignedQuizExamplesProps | undefined;
  unassignedExamplesProps: UnassignedExamplesProps;
  assignButtonProps: AssignButtonProps;

  // Mutations
  assignExamples: () => Promise<void>;
  assigningError: Error | null;
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

  // Conditional queries based on assignment type - always enabled to show current state
  // Queries are enabled immediately when student/quiz is selected to provide real-time feedback
  const {
    flashcards,
    isLoading: isLoadingFlashcards,
    error: flashcardsError,
  } = useFlashcardsQuery();

  // Query quiz examples when a quiz is selected (even if not in quiz mode, to show current state)
  const {
    quizExamples,
    isLoading: isLoadingQuizExamples,
    error: quizExamplesError,
  } = useQuizExamplesQuery({
    courseCode: selectedQuizRecord?.courseCode || '',
    quizNumber: selectedQuizRecord?.quizNumber || 0,
  });

  // Query flashcards when a student is active (always enabled to show current state)
  // useFlashcardsQuery already handles this via useActiveStudent internally

  // For student mode: use flashcards directly (FlashcardTable expects Flashcard[])
  // For quiz mode: use quiz examples (ExampleTable expects ExampleWithVocabulary[])

  // Filter out examples that are already assigned (for unassigned list)
  // Uses Set-based deduplication for O(1) lookup performance when filtering large lists
  const unassignedExamples = useMemo(() => {
    if (assignmentType === 'students' && flashcards) {
      // Filter selected examples that aren't already flashcards
      const flashcardExampleIds = new Set(
        flashcards.map((fc) => fc.example.id),
      );
      return selectedExamples.filter((ex) => !flashcardExampleIds.has(ex.id));
    }
    if (assignmentType === 'quiz' && quizExamples) {
      // Filter selected examples that aren't already in quiz
      const quizExampleIds = new Set(quizExamples.map((ex) => ex.id));
      return selectedExamples.filter((ex) => !quizExampleIds.has(ex.id));
    }
    return selectedExamples;
  }, [assignmentType, flashcards, quizExamples, selectedExamples]);

  // Mutations
  const { addExamplesToQuiz, isAddingExamples, addingExamplesError } =
    useQuizExampleMutations();
  const { createFlashcards } = useFlashcardsQuery();

  // Provide studentFlashcards and lessonPopup for child components
  const studentFlashcards = useStudentFlashcards();
  const { lessonPopup } = useLessonPopup();

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

  // Determine target name for display
  const targetName = useMemo(() => {
    if (assignmentType === 'students') {
      return appUser?.name || 'Student';
    }
    return (
      selectedQuizRecord?.quizNickname ||
      (selectedQuizRecord?.quizNumber
        ? `Quiz ${selectedQuizRecord.quizNumber}`
        : 'Quiz')
    );
  }, [assignmentType, appUser?.name, selectedQuizRecord]);

  // Determine if assignment is possible
  const canAssign = useMemo(
    () =>
      selectedExamples.length > 0 &&
      unassignedExamples.length > 0 &&
      !isAddingExamples &&
      ((assignmentType === 'students' && appUser !== null) ||
        (assignmentType === 'quiz' && selectedQuizRecord !== undefined)),
    [
      selectedExamples.length,
      unassignedExamples.length,
      isAddingExamples,
      assignmentType,
      appUser,
      selectedQuizRecord,
    ],
  );

  // Compose props objects in memo before returning
  const assignmentTypeSelectorProps = useMemo<AssignmentTypeSelectorProps>(
    () => ({
      assignmentType,
      onToggle: toggleAssignmentType,
    }),
    [assignmentType, toggleAssignmentType],
  );

  const studentSelectionProps = useMemo<StudentSelectionProps>(
    () => ({
      isLoading: isLoadingActiveStudent,
    }),
    [isLoadingActiveStudent],
  );

  const quizSelectionProps = useMemo<QuizSelectionProps>(
    () => ({
      selectedCourseCode,
      onCourseCodeChange: setSelectedCourseCode,
      selectedQuizRecordId,
      onQuizRecordIdChange: setSelectedQuizRecordId,
      availableQuizzes,
      courseOptions,
    }),
    [
      selectedCourseCode,
      setSelectedCourseCode,
      selectedQuizRecordId,
      setSelectedQuizRecordId,
      availableQuizzes,
      courseOptions,
    ],
  );

  // Pagination for student flashcards
  const studentFlashcardsPagination = usePagination({
    itemsPerPage: 50,
    totalItems: flashcards?.length || 0,
  });

  const displayFlashcards = useMemo(() => {
    if (!flashcards) return [];
    return flashcards.slice(
      studentFlashcardsPagination.startIndex,
      studentFlashcardsPagination.endIndex,
    );
  }, [
    flashcards,
    studentFlashcardsPagination.startIndex,
    studentFlashcardsPagination.endIndex,
  ]);

  // Props for student flashcards (FlashcardTable)
  const assignedStudentFlashcardsProps = useMemo<
    AssignedStudentFlashcardsProps | undefined
  >(() => {
    if (assignmentType !== 'students' || !flashcards) return undefined;
    return {
      allFlashcards: flashcards,
      displayFlashcards,
      paginationState: studentFlashcardsPagination,
      isLoading: isLoadingFlashcards,
      error: flashcardsError,
      targetName,
      onGoingToQuiz: () => {}, // No-op for assigner context
    };
  }, [
    assignmentType,
    flashcards,
    displayFlashcards,
    studentFlashcardsPagination,
    isLoadingFlashcards,
    flashcardsError,
    targetName,
  ]);

  // Props for quiz examples (ExampleTable)
  const assignedQuizExamplesProps = useMemo<
    AssignedQuizExamplesProps | undefined
  >(() => {
    if (assignmentType !== 'quiz' || !quizExamples) return undefined;
    return {
      examples: quizExamples,
      isLoading: isLoadingQuizExamples || isLoadingQuizzes,
      error: quizExamplesError,
      targetName,
      studentFlashcards,
      lessonPopup,
    };
  }, [
    assignmentType,
    quizExamples,
    isLoadingQuizExamples,
    isLoadingQuizzes,
    quizExamplesError,
    targetName,
    studentFlashcards,
    lessonPopup,
  ]);

  const unassignedExamplesProps = useMemo<UnassignedExamplesProps>(
    () => ({
      examples: unassignedExamples,
      studentFlashcards,
      lessonPopup,
    }),
    [unassignedExamples, studentFlashcards, lessonPopup],
  );

  const assignButtonProps = useMemo<AssignButtonProps>(
    () => ({
      assignmentType,
      unassignedCount: unassignedExamples.length,
      isAssigning: isAddingExamples,
      canAssign,
      activeStudentName: appUser?.name,
      quizName:
        selectedQuizRecord?.quizNickname ||
        (selectedQuizRecord?.quizNumber
          ? `Quiz ${selectedQuizRecord.quizNumber}`
          : null),
      onClick: assignExamples,
    }),
    [
      assignmentType,
      unassignedExamples.length,
      isAddingExamples,
      canAssign,
      appUser?.name,
      selectedQuizRecord,
      assignExamples,
    ],
  );

  return {
    // Selected examples
    selectedExamples,
    isFetchingSelectedExamples,

    // Props objects
    assignmentTypeSelectorProps,
    studentSelectionProps,
    quizSelectionProps,
    assignedStudentFlashcardsProps,
    assignedQuizExamplesProps,
    unassignedExamplesProps,
    assignButtonProps,

    // Mutations
    assignExamples,
    assigningError: addingExamplesError,
  };
}
