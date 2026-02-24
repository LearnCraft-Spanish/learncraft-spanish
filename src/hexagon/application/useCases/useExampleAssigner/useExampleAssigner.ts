import type { LessonPopup } from '@application/units/useLessonPopup';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useAllQuizGroups } from '@application/queries/useAllQuizGroups';
import { useFlashcardsQuery } from '@application/queries/useFlashcardsQuery';
import { useQuizExampleMutations } from '@application/queries/useQuizExampleMutations';
import { useQuizExamples } from '@application/queries/useQuizExamples';
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
  selectedQuizGroupId: number | undefined;
  onQuizGroupIdChange: (id: number | undefined) => void;
  selectedQuizRecordId: number | undefined;
  onQuizRecordIdChange: (id: number | undefined) => void;
  availableQuizzes:
    | Array<{
        id: number;
        published: boolean;
        quizTitle?: string;
        quizNumber?: number;
        relatedQuizGroupId: number | null;
      }>
    | undefined;
  quizGroupOptions: Array<{ id: number; name: string }>;
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
  const [selectedQuizGroupId, setSelectedQuizGroupId] = useState<
    number | undefined
  >(undefined);
  const [selectedQuizRecordId, setSelectedQuizRecordId] = useState<
    number | undefined
  >(undefined);

  // Get selected examples
  const { selectedExamples, isFetchingExamples } = useSelectedExamples();
  const isFetchingSelectedExamples = isFetchingExamples > 0;

  // Get active student
  const { appUser, isLoading: isLoadingActiveStudent } = useActiveStudent();

  // get all quiz groups
  const { quizGroups, isLoading: isLoadingQuizGroups } = useAllQuizGroups();

  // Filter quizzes by selected course
  const availableQuizzes = useMemo(() => {
    if (!quizGroups || selectedQuizGroupId === undefined) return undefined;
    const quizGroup = quizGroups?.find(
      (group) => group.id === selectedQuizGroupId,
    );

    return quizGroup?.quizzes ?? [];
  }, [quizGroups, selectedQuizGroupId]);

  const selectedQuizGroup = useMemo(() => {
    if (!quizGroups || selectedQuizGroupId === undefined) return undefined;
    return quizGroups?.find((group) => group.id === selectedQuizGroupId);
  }, [quizGroups, selectedQuizGroupId]);

  // Get selected quiz record
  const selectedQuizRecord = useMemo(() => {
    if (
      assignmentType !== 'quiz' ||
      !selectedQuizGroupId ||
      !selectedQuizRecordId ||
      !availableQuizzes
    ) {
      return undefined;
    }
    const quiz = availableQuizzes.find((q) => q.id === selectedQuizRecordId);
    if (!quiz) {
      return undefined;
    }
    return quiz;
  }, [
    assignmentType,
    selectedQuizGroupId,
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
    data: quizExamples,
    isLoading: isLoadingQuizExamples,
    isFetching: isFetchingQuizExamples,
    error: quizExamplesError,
  } = useQuizExamples({
    quizId: selectedQuizRecord?.id ?? 0,
    vocabularyComplete: undefined,
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
        quizId: selectedQuizRecord.id,
        courseCode: selectedQuizGroup?.urlSlug || '',
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
    selectedQuizGroup,
    selectedQuizRecord,
    createFlashcards,
    addExamplesToQuiz,
  ]);

  const handleTypeChange = useCallback((type: AssignmentType) => {
    setAssignmentType(type);
    // Reset quiz selection when switching
    if (type === 'students') {
      setSelectedQuizGroupId(undefined);
      setSelectedQuizRecordId(undefined);
    }
  }, []);

  // Determine target name for display
  const targetName = useMemo(() => {
    if (assignmentType === 'students') {
      return appUser?.name || 'Student';
    }
    return (
      selectedQuizRecord?.quizTitle ||
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
      !isLoadingQuizGroups,
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
      isLoadingQuizGroups,
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
      selectedQuizGroupId,
      onQuizGroupIdChange: setSelectedQuizGroupId,
      selectedQuizRecordId,
      onQuizRecordIdChange: setSelectedQuizRecordId,
      availableQuizzes,
      quizGroupOptions:
        quizGroups?.map((group) => ({ id: group.id, name: group.name })) ?? [],
    }),
    [
      selectedQuizGroupId,
      setSelectedQuizGroupId,
      selectedQuizRecordId,
      setSelectedQuizRecordId,
      availableQuizzes,
      quizGroups,
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
        isLoadingQuizExamples || isLoadingQuizGroups || isFetchingQuizExamples,
      error: quizExamplesError,
      targetName,
      studentFlashcards,
      lessonPopup,
    };
  }, [
    assignmentType,
    quizExamples,
    isLoadingQuizExamples,
    isLoadingQuizGroups,
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
        selectedQuizRecord?.quizTitle ||
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
