import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import ConfirmationDialog from 'src/components/ExampleManager/ConfirmationDialog';
import ExampleAssignmentPanel from 'src/components/ExampleManager/ExampleAssignmentPanel';
import ExampleEditForm from 'src/components/ExampleManager/ExampleEditForm';
import ExamplePasteArea from 'src/components/ExampleManager/ExamplePasteArea';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import { useBackend } from 'src/hooks/useBackend';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';

interface SetExampleCreatorProps {
  hasAccess: boolean;
}

export default function ExampleSetCreator({
  hasAccess,
}: SetExampleCreatorProps) {
  const queryClient = useQueryClient();
  const { getExampleSetBySpanishText, createMultipleUnverifiedExamples } =
    useBackend();

  const [pastingOrEditing, setPastingOrEditing] = useState<
    'pasting' | 'editing' | 'assigning'
  >('pasting');
  const [unsavedFlashcardSet, setUnsavedFlashcardSet] = useState<Flashcard[]>(
    [],
  );
  const [flashcardSpanish, setFlashcardSpanish] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const [showAssignmentConfirmation, setShowAssignmentConfirmation] =
    useState(false);
  const awaitingAddResolution = useRef(0);
  const tempId = useRef(-1);

  const [assignmentType, setAssignmentType] = useState<'students' | 'quiz'>(
    'students',
  );
  const [tableOption, setTableOption] = useState('none');
  const [quizId, setQuizId] = useState<number | undefined>(undefined);

  const { appUser } = useActiveStudent();
  const { addMultipleFlashcardsMutation, flashcardDataQuery } =
    useStudentFlashcards();
  const { officialQuizzesQuery, quizExamplesQuery, addQuizExamplesMutation } =
    useOfficialQuizzes(quizId);

  // Filter quizzes by selected course
  const quizList = useMemo(() => {
    return officialQuizzesQuery.data?.filter((quiz) => {
      const courseCode = quiz.quizNickname.split(' ')[0];
      return courseCode === tableOption;
    });
  }, [officialQuizzesQuery.data, tableOption]);

  // Selected quiz object
  const selectedQuizObject = useMemo(() => {
    return quizList?.find((quiz) => quiz.recordId === quizId);
  }, [quizList, quizId]);

  // Clear all state and restart
  const clearAndRestart = useCallback(() => {
    setPastingOrEditing('pasting');
    setUnsavedFlashcardSet([]);
    setFlashcardSpanish([]);
    setAreaInput('');
    setAssignmentType('students');
    setTableOption('none');
    setQuizId(undefined);
    awaitingAddResolution.current = 0;
    tempId.current = -1;
  }, []);

  // Parse the pasted input into flashcard objects
  const parsedAreaInput = useMemo(() => {
    const lines = areaInput
      .split('\n')
      // Skip completely empty lines or lines with just whitespace/tabs
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split('\t'));

    const parsedRecords = lines
      .map((line) => {
        const spanishText = line[0]?.trim() || '';
        const englishText = line[1]?.trim() || '';
        const hasSpanish = !!spanishText;
        const hasEnglish = !!englishText;

        // Skip invalid rows by returning null
        if (!hasSpanish || !hasEnglish) {
          return null;
        }

        return {
          spanishExample: spanishText,
          englishTranslation: englishText,
          spanglish: spanishText.includes('*') ? 'spanglish' : 'esp',
          spanishAudioLa: line[2]?.trim() || '',
          englishAudio: line[3]?.trim() || '',
          vocabComplete: false,
          recordId: tempId.current--,
          vocabIncluded: [],
        } as Flashcard;
      })
      .filter((record): record is Flashcard => record !== null);

    return parsedRecords;
  }, [areaInput]);

  // Query for existing flashcard set
  const exampleSetQuery = useQuery({
    queryKey: ['flashcardSet'],
    queryFn: () => getExampleSetBySpanishText(flashcardSpanish),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: hasAccess && flashcardSpanish.length > 0,
  });

  // Get unassigned examples as a derived value
  const unassignedExamples = useMemo(() => {
    if (!exampleSetQuery.data) return [];

    // Create sets of Spanish examples that are already assigned
    const assignedToQuiz = new Set<string>();
    const assignedToStudent = new Set<string>();

    // If we're in quiz assignment mode and have quiz examples data
    if (assignmentType === 'quiz' && quizExamplesQuery.data) {
      quizExamplesQuery.data.forEach((example) =>
        assignedToQuiz.add(example.spanishExample),
      );
    }

    // If we're in student assignment mode and have student flashcards data
    if (assignmentType === 'students' && flashcardDataQuery.data) {
      flashcardDataQuery.data.examples.forEach((example) =>
        assignedToStudent.add(example.spanishExample),
      );
    }

    // Filter out examples that are already assigned based on assignment type
    return exampleSetQuery.data.filter((example) => {
      if (assignmentType === 'quiz') {
        return !assignedToQuiz.has(example.spanishExample);
      } else {
        return !assignedToStudent.has(example.spanishExample);
      }
    });
  }, [
    exampleSetQuery.data,
    assignmentType,
    quizExamplesQuery.data,
    flashcardDataQuery.data,
  ]);

  // Get assigned examples count as a derived value
  const assignedExamplesCount = useMemo(() => {
    if (!exampleSetQuery.data) return 0;
    return exampleSetQuery.data.length - unassignedExamples.length;
  }, [exampleSetQuery.data, unassignedExamples]);

  // Check for existing examples in the database
  const existingExamples = useMemo(() => {
    if (!exampleSetQuery.data) return new Set<string>();
    return new Set(exampleSetQuery.data.map((ex) => ex.spanishExample));
  }, [exampleSetQuery.data]);

  // Calculate validation summary
  const validationSummary = useMemo(() => {
    if (!areaInput.trim()) return null;

    const totalRows = areaInput
      .split('\n')
      .filter((line) => line.trim().length > 0).length;

    // Track which Spanish examples we've seen to detect duplicates
    const seenSpanishExamples = new Set<string>();

    const validRows = parsedAreaInput.filter((ex) => {
      // Check for errors only
      if (
        ex.spanishExample.includes('ERROR') ||
        ex.englishTranslation.includes('ERROR')
      ) {
        return false;
      }

      // Check for duplicates
      if (seenSpanishExamples.has(ex.spanishExample)) {
        return false;
      }
      seenSpanishExamples.add(ex.spanishExample);

      return true;
    }).length;

    return {
      total: totalRows,
      valid: validRows,
      invalid: totalRows - validRows,
    };
  }, [areaInput, parsedAreaInput]);

  // Add parsed input to the flashcard set
  const addInputToFlashcardSet = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
    // Keep only the first instance of each Spanish example and filter out any remaining invalid rows
    const uniqueExamples = parsedAreaInput.reduce((acc, current) => {
      if (
        !acc.some((item) => item.spanishExample === current.spanishExample) &&
        current.spanishExample &&
        current.englishTranslation
      ) {
        acc.push(current);
      }
      return acc;
    }, [] as Flashcard[]);

    const newSpanish = uniqueExamples.map((example) => example.spanishExample);
    setFlashcardSpanish((prev) => [...new Set([...prev, ...newSpanish])]);
    setUnsavedFlashcardSet((prev) => [...prev, ...uniqueExamples]);
    setPastingOrEditing('editing');
    setAreaInput('');
  }, [queryClient, parsedAreaInput]);

  // Prepare flashcards for backend
  const sendExampleSet = useCallback(
    (flashcards: Flashcard[]) => {
      const newFlashcardSet: NewFlashcard[] = flashcards.map((flashcard) => ({
        spanishExample: flashcard.spanishExample,
        englishTranslation: flashcard.englishTranslation,
        spanglish: flashcard.spanglish,
        spanishAudioLa: flashcard.spanishAudioLa,
        englishAudio: flashcard.englishAudio,
        vocabComplete: false,
      }));
      return createMultipleUnverifiedExamples(newFlashcardSet);
    },
    [createMultipleUnverifiedExamples],
  );

  // Mutation for saving flashcard set
  const addFlashcardSetMutation = useMutation({
    mutationFn: sendExampleSet,
    onMutate: async (flashcards: Flashcard[]) => {
      await queryClient.cancelQueries({ queryKey: ['flashcardSet'] });
      const previousFlashcardSet: Flashcard[] =
        queryClient.getQueryData(['flashcardSet']) || [];
      queryClient.setQueryData(
        ['flashcardSet'],
        [...previousFlashcardSet, ...flashcards],
      );
      return {
        previousFlashcardSet,
        unsavedFlashcardSet: [...unsavedFlashcardSet],
      };
    },
    onError: (_err, _variables, context) => {
      toast.error('Failed to save examples');
      if (context?.previousFlashcardSet && context?.unsavedFlashcardSet) {
        const unsavedFlashcardsToRestore = context.unsavedFlashcardSet.filter(
          (unsavedFlashcard) =>
            !context.previousFlashcardSet.some(
              (savedFlashcard) =>
                savedFlashcard.spanishExample ===
                unsavedFlashcard.spanishExample,
            ),
        );
        const spanishToRestore = unsavedFlashcardsToRestore.map(
          (unsavedFlashcard) => unsavedFlashcard.spanishExample,
        );
        setUnsavedFlashcardSet(unsavedFlashcardsToRestore);
        setFlashcardSpanish([...flashcardSpanish, ...spanishToRestore]);
        queryClient.setQueryData(
          ['flashcardSet'],
          context.previousFlashcardSet,
        );
        awaitingAddResolution.current++;
      }
    },
    onSuccess: async () => {
      toast.success('Examples saved successfully');
      awaitingAddResolution.current++;
    },
    onSettled: () => {
      // Don't invalidate the query immediately to keep the success state
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
      }, 1000);
    },
  });

  // Handle resolution of saved examples
  useEffect(() => {
    if (!exampleSetQuery.data?.length) return;

    if (awaitingAddResolution.current > 1) {
      awaitingAddResolution.current--;
    }
    if (awaitingAddResolution.current === 1) {
      if (unsavedFlashcardSet.length === 0 && exampleSetQuery.data.length) {
        toast.success('All examples saved');
      } else {
        toast.error('Some examples failed to save');
      }
      awaitingAddResolution.current = 0;
    }
    if (awaitingAddResolution.current === 0) {
      const savedFlashcards: Flashcard[] = exampleSetQuery.data;
      const filteredUnsavedSet = unsavedFlashcardSet.filter(
        (flashcard) =>
          !savedFlashcards.some(
            (savedFlashcard) =>
              savedFlashcard.spanishExample === flashcard.spanishExample,
          ),
      );
      if (filteredUnsavedSet.length !== unsavedFlashcardSet.length) {
        setUnsavedFlashcardSet(filteredUnsavedSet);
      }
    }
  }, [exampleSetQuery.data, unsavedFlashcardSet]);

  // Update flashcard values
  const updateFlashcardSetValues = useCallback(
    (changedObjTempId: number, field: string, newValue: string) => {
      let newSpanglish = '';
      if (field === 'spanishExample') {
        const oldSpanish = unsavedFlashcardSet.find(
          (flashcard) => flashcard.recordId === changedObjTempId,
        )?.spanishExample;
        const spanishIndex = flashcardSpanish.findIndex(
          (spanish) => spanish === oldSpanish,
        );
        const newSpanishArray = [...flashcardSpanish];
        newSpanishArray[spanishIndex] = newValue;
        setFlashcardSpanish(newSpanishArray);
        newSpanglish = newValue.includes('*') ? 'spanglish' : 'esp';
      }
      const newFlashcardSet = unsavedFlashcardSet.map((flashcard) => {
        if (flashcard.recordId === changedObjTempId) {
          return {
            ...flashcard,
            [field]: newValue,
            spanglish:
              field === 'spanishExample' ? newSpanglish : flashcard.spanglish,
          };
        }
        return flashcard;
      });
      setUnsavedFlashcardSet(newFlashcardSet);
    },
    [unsavedFlashcardSet, flashcardSpanish],
  );

  // Update the confirmation handler to invalidate the appropriate queries after mutation
  const handleConfirmAssignment = useCallback(() => {
    setShowAssignmentConfirmation(false);

    if (assignmentType === 'students') {
      // Map unassigned examples to the format expected by the mutation
      const exampleData = unassignedExamples.map((example) => {
        // Ensure we have all required fields
        if (
          !example.recordId ||
          !example.spanishExample ||
          !example.englishTranslation ||
          !example.spanglish
        ) {
          throw new Error('Missing required fields in flashcard');
        }
        return {
          recordId: example.recordId,
          spanishExample: example.spanishExample,
          englishTranslation: example.englishTranslation,
          spanglish: example.spanglish,
          spanishAudioLa: example.spanishAudioLa || '',
          englishAudio: example.englishAudio || '',
          vocabComplete: false,
          vocabIncluded: [],
          coachAdded: true,
        };
      });

      if (exampleData.length > 0) {
        addMultipleFlashcardsMutation.mutate(exampleData, {
          onSuccess: (data) => {
            toast.success(
              `Successfully assigned ${data.length} examples to student`,
            );
            // Invalidate the flashcardData query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
          },
        });
      } else {
        toast.info('All examples have already been assigned');
      }
    } else if (assignmentType === 'quiz' && selectedQuizObject) {
      // Get the IDs of unassigned examples
      const exampleIds = unassignedExamples.map((example) => example.recordId);

      if (exampleIds.length > 0) {
        // Call the mutation to assign examples to the quiz
        addQuizExamplesMutation.mutate(
          {
            quizId: selectedQuizObject.recordId,
            exampleIds,
          },
          {
            onSuccess: (data) => {
              toast.success(
                `Successfully assigned ${data.length} examples to quiz`,
              );
              // Invalidate the quizExamples query to refresh the list
              queryClient.invalidateQueries({
                queryKey: ['quizExamples', selectedQuizObject.recordId],
              });
            },
          },
        );
      } else {
        toast.info('All examples have already been assigned');
      }
    }
  }, [
    assignmentType,
    unassignedExamples,
    selectedQuizObject,
    addMultipleFlashcardsMutation,
    addQuizExamplesMutation,
    queryClient,
  ]);

  // Toggle assignment type handler
  const handleToggleAssignmentType = useCallback(() => {
    setAssignmentType(assignmentType === 'students' ? 'quiz' : 'students');
  }, [assignmentType]);

  if (!hasAccess) {
    return <div>You do not have access to create example sets.</div>;
  }

  return (
    <div>
      <h3>Example Set Creator</h3>
      {pastingOrEditing === 'pasting' && (
        <ExamplePasteArea
          areaInput={areaInput}
          onInputChange={setAreaInput}
          validationSummary={validationSummary}
          parsedAreaInput={parsedAreaInput}
          existingExamples={existingExamples}
          onNext={addInputToFlashcardSet}
        />
      )}

      {pastingOrEditing === 'editing' && (
        <ExampleEditForm
          unsavedFlashcardSet={unsavedFlashcardSet}
          onUpdateExample={updateFlashcardSetValues}
          onSave={() => addFlashcardSetMutation.mutate(unsavedFlashcardSet)}
          onBack={() => setPastingOrEditing('pasting')}
          onContinue={() => setPastingOrEditing('assigning')}
          onRestart={clearAndRestart}
          isSaving={addFlashcardSetMutation.isPending}
          exampleSetQuery={exampleSetQuery}
        />
      )}

      {pastingOrEditing === 'assigning' && (
        <ExampleAssignmentPanel
          assignmentType={assignmentType}
          onToggleAssignmentType={handleToggleAssignmentType}
          tableOption={tableOption}
          onTableOptionChange={setTableOption}
          quizId={quizId}
          onQuizIdChange={setQuizId}
          quizList={quizList}
          selectedQuizObject={selectedQuizObject}
          exampleSetQuery={exampleSetQuery}
          unassignedExamples={unassignedExamples}
          assignedExamplesCount={assignedExamplesCount}
          onShowConfirmation={() => setShowAssignmentConfirmation(true)}
          onBack={() => setPastingOrEditing('pasting')}
          onBackToEdit={() => setPastingOrEditing('editing')}
          onRestart={clearAndRestart}
          isPending={
            addMultipleFlashcardsMutation.isPending ||
            addQuizExamplesMutation.isPending
          }
          activeStudent={appUser || null}
          flashcardDataQuery={flashcardDataQuery}
          quizExamplesQuery={quizExamplesQuery}
        />
      )}

      {showAssignmentConfirmation && (
        <ConfirmationDialog
          assignmentType={assignmentType}
          unassignedExamples={unassignedExamples}
          selectedQuizObject={selectedQuizObject}
          activeStudent={appUser || null}
          onConfirm={handleConfirmAssignment}
          onCancel={() => setShowAssignmentConfirmation(false)}
          isPending={
            addMultipleFlashcardsMutation.isPending ||
            addQuizExamplesMutation.isPending
          }
        />
      )}
    </div>
  );
}
