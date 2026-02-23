import type { LessonPopup } from '@application/units/useLessonPopup';
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
import useLessonPopup from '@application/units/useLessonPopup';
import { getUnassignedExamples } from '@application/useCases/useExampleAssigner/helpers';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

export type AssignmentType = 'students' | 'quiz';

export interface AssignmentTypeSelectorProps {
  assignmentType: AssignmentType;
  onTypeChange: (type: AssignmentType) => void;
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
  studentFlashcards: Flashcard[];

  isLoading: boolean;
  error: Error | null;
  targetName: string;

  lessonPopup: LessonPopup;
}

export interface AssignedQuizExamplesProps {
  examples: ExampleWithVocabulary[] | undefined;

  isLoading: boolean;
  error: Error | null;
  targetName: string;

  lessonPopup: LessonPopup;
}

export interface UnassignedExamplesProps {
  examples: ExampleWithVocabulary[];
  studentFlashcards: Flashcard[] | undefined;
  totalSelectedExamplesCount: number;
  isLoading: boolean;
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
  const {
    quizGroups,
    officialQuizRecords,
    isLoading: isLoadingQuizzes,
  } = useOfficialQuizzesQuery();

  // Filter quizzes by selected course
  const availableQuizzes = useMemo(() => {
    if (!officialQuizRecords || selectedCourseCode === 'none') return undefined;
    const quizGroup = quizGroups?.find(
      (group) => group.urlSlug === selectedCourseCode,
    );

    return (
      quizGroup?.quizzes.map((quiz) => ({
        recordId: quiz.id,
        quizNickname: quiz.quizTitle,
        quizNumber: quiz.quizNumber,
        courseCode: quizGroup.urlSlug,
      })) ?? []
    );
  }, [quizGroups, selectedCourseCode, officialQuizRecords]);

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
    flashcards: studentFlashcards,
    isLoading: isLoadingFlashcards,
    isFetchingFlashcards,
    error: flashcardsError,
  } = useFlashcardsQuery();

  // Query quiz examples when a quiz is selected (even if not in quiz mode, to show current state)
  const {
    quizExamples,
    isLoading: isLoadingQuizExamples,
    isFetching: isFetchingQuizExamples,
    error: quizExamplesError,
  } = useQuizExamplesQuery({
    courseCode: selectedQuizRecord?.courseCode || '',
    quizNumber: selectedQuizRecord?.quizNumber || 0,
    ignoreCache: true,
  });

  // Query flashcards when a student is active (always enabled to show current state)
  // useFlashcardsQuery already handles this via useActiveStudent internally

  // For student mode: use flashcards directly (FlashcardTable expects Flashcard[])
  // For quiz mode: use quiz examples (ExampleTable expects ExampleWithVocabulary[])

  // Filter out examples that are already assigned (for unassigned list)
  const unassignedExamples = useMemo(() => {
    if (assignmentType === 'students' && studentFlashcards) {
      const flashcardExampleIds = new Set(
        studentFlashcards.map((fc) => fc.example.id),
      );
      return getUnassignedExamples(selectedExamples, flashcardExampleIds);
    }
    if (assignmentType === 'quiz' && quizExamples) {
      const quizExampleIds = new Set(quizExamples.map((ex) => ex.id));
      return getUnassignedExamples(selectedExamples, quizExampleIds);
    }
    return getUnassignedExamples(selectedExamples, undefined);
  }, [assignmentType, studentFlashcards, quizExamples, selectedExamples]);

  // Mutations
  const { addExamplesToQuiz, isAddingExamples, addingExamplesError } =
    useQuizExampleMutations();
  const { createFlashcards } = useFlashcardsQuery();

  // Provide studentFlashcards and lessonPopup for child components
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
      const createFlashcardsPromise = createFlashcards(selectedExamples);
      toast.promise(createFlashcardsPromise, {
        pending: 'Assigning flashcards...',
        success: 'Flashcards assigned',
        error: 'Failed to assign flashcards',
      });
      await createFlashcardsPromise;
    } else if (assignmentType === 'quiz') {
      if (!selectedQuizRecord) {
        throw new Error('No quiz selected');
      }
      const exampleIds = selectedExamples.map((ex) => ex.id);
      const addExamplesToQuizPromise = addExamplesToQuiz({
        courseCode: selectedQuizRecord.courseCode,
        quizNumber: selectedQuizRecord.quizNumber,
        exampleIds,
      });
      toast.promise(addExamplesToQuizPromise, {
        pending: 'Adding examples to quiz...',
        success: 'Examples added to quiz',
        error: 'Failed to add examples to quiz',
      });
      await addExamplesToQuizPromise;
    }
  }, [
    selectedExamples,
    assignmentType,
    appUser?.recordId,
    selectedQuizRecord,
    createFlashcards,
    addExamplesToQuiz,
  ]);

  const handleTypeChange = useCallback((type: AssignmentType) => {
    setAssignmentType(type);
    // Reset quiz selection when switching
    if (type === 'students') {
      setSelectedCourseCode('none');
      setSelectedQuizRecordId(undefined);
    }
  }, []);

  // Map quiz groups to course options (code and name format)
  const courseOptions = useMemo(() => {
    if (!quizGroups) return [];
    return quizGroups.map((group) => ({
      code: group.urlSlug,
      name: group.name,
    }));
  }, [quizGroups]);

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
        (assignmentType === 'quiz' && selectedQuizRecord !== undefined)) &&
      !isLoadingFlashcards &&
      !isFetchingFlashcards &&
      !isLoadingQuizExamples &&
      !isFetchingQuizExamples &&
      !isLoadingQuizzes,
    [
      selectedExamples.length,
      unassignedExamples.length,
      isAddingExamples,
      assignmentType,
      appUser,
      selectedQuizRecord,
      isLoadingFlashcards,
      isFetchingFlashcards,
      isLoadingQuizExamples,
      isFetchingQuizExamples,
      isLoadingQuizzes,
    ],
  );

  // Compose props objects in memo before returning
  const assignmentTypeSelectorProps = useMemo<AssignmentTypeSelectorProps>(
    () => ({
      assignmentType,
      onTypeChange: handleTypeChange,
    }),
    [assignmentType, handleTypeChange],
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

  // Props for student flashcards (FlashcardTable)
  const assignedStudentFlashcardsProps = useMemo<
    AssignedStudentFlashcardsProps | undefined
  >(() => {
    if (assignmentType !== 'students' || !studentFlashcards) return undefined;
    return {
      studentFlashcards,
      isLoading: isLoadingFlashcards || isFetchingFlashcards,
      error: flashcardsError,
      targetName,
      lessonPopup,
    };
  }, [
    assignmentType,
    studentFlashcards,
    isLoadingFlashcards,
    isFetchingFlashcards,
    flashcardsError,
    targetName,
    lessonPopup,
  ]);

  // Props for quiz examples (ExampleTable)
  const assignedQuizExamplesProps = useMemo<
    AssignedQuizExamplesProps | undefined
  >(() => {
    if (assignmentType !== 'quiz' || !quizExamples) return undefined;
    return {
      examples: quizExamples,
      isLoading:
        isLoadingQuizExamples || isLoadingQuizzes || isFetchingQuizExamples,
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
    isFetchingQuizExamples,
    quizExamplesError,
    targetName,
    studentFlashcards,
    lessonPopup,
  ]);

  const unassignedExamplesProps = useMemo<UnassignedExamplesProps>(
    () => ({
      examples: unassignedExamples,
      studentFlashcards: studentFlashcards || [],
      totalSelectedExamplesCount: selectedExamples.length,
      lessonPopup,
      isLoading:
        isLoadingFlashcards ||
        isFetchingFlashcards ||
        isFetchingQuizExamples ||
        isLoadingQuizExamples,
    }),
    [
      unassignedExamples,
      studentFlashcards,
      lessonPopup,
      selectedExamples.length,
      isLoadingFlashcards,
      isFetchingFlashcards,
      isFetchingQuizExamples,
      isLoadingQuizExamples,
    ],
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
