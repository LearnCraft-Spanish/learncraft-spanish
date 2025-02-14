import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useCallback, useRef } from 'react';
import type {
  Flashcard,
  StudentExample,
  StudentFlashcardData,
} from 'src/types/interfaceDefinitions';
import { useBackend } from 'src/hooks/useBackend';
import { toast } from 'react-toastify';
import { useActiveStudent } from './useActiveStudent';
import { useUserData } from './useUserData';

export function useStudentFlashcards() {
  const queryClient = useQueryClient();
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const {
    getMyExamplesFromBackend,
    getActiveExamplesFromBackend,
    createStudentExample,
    createMyStudentExample,
    deleteStudentExample,
    deleteMyStudentExample,
    updateStudentExample,
    updateMyStudentExample,
  } = useBackend();

  // Temporary ID to generate unique placeholder keys for new flashcards
  // Initialize only if it doesn't exist
  if (queryClient.getQueryData(['tempIdCounter']) === undefined) {
    queryClient.setQueryData(['tempIdCounter'], -1);
  }

  // Abbreviated access since it's used frequently
  const activeStudentId = activeStudentQuery.data?.recordId;

  // Dependency array for flashcardDataQuery
  const flashcardDataDependencies =
    userDataQuery.isSuccess &&
    activeStudentQuery.isSuccess &&
    !!activeStudentId;

  const matchAndTrimArrays = useCallback(
    (flashcardData: StudentFlashcardData) => {
      const exampleArray = flashcardData.examples;
      const studentExampleArray = flashcardData.studentExamples;
      const sortedExamples = exampleArray.sort(
        (a, b) => a.recordId - b.recordId,
      );
      const sortedStudentExamples = studentExampleArray.sort(
        (a, b) => a.relatedExample - b.relatedExample,
      );
      const filteredExamples = sortedExamples.filter((example) => {
        const match = studentExampleArray.find(
          (studentExample) =>
            studentExample.relatedExample === example.recordId,
        );
        return match;
      });
      const filteredStudentExamples = sortedStudentExamples.filter(
        (studentExample) => {
          const match = exampleArray.find(
            (example) => example.recordId === studentExample.relatedExample,
          );
          return match;
        },
      );
      if (filteredExamples.length === filteredStudentExamples.length) {
        return {
          examples: filteredExamples,
          studentExamples: filteredStudentExamples,
        };
      }
      return null;
    },
    [],
  );

  const getFlashcardData = async () => {
    let backendResponse: StudentFlashcardData | undefined;

    if (userDataQuery.data?.roles.adminRole === 'coach' && activeStudentId) {
      backendResponse = await getActiveExamplesFromBackend(activeStudentId);
    } else if (userDataQuery.data?.roles.studentRole === 'student') {
      backendResponse = await getMyExamplesFromBackend();
    }

    if (!backendResponse) {
      throw new Error('No active student');
    }

    // Get the current cached data (previous session state)
    const previousData = queryClient.getQueryData<StudentFlashcardData>([
      'flashcardData',
      activeStudentId,
    ]);

    // Preserve the "reviewed" status from previousData if it exists
    const mergedExampleData = backendResponse.examples.map((flashcard) => {
      const previousFlashcard = previousData?.examples.find(
        (prev) => prev.recordId === flashcard.recordId,
      );
      return {
        ...flashcard,
        difficulty: previousFlashcard?.difficulty,
      };
    });

    const mergedStudentExampleData = backendResponse.studentExamples; // Placeholder for future merge needs

    const mergedFlashcardData: StudentFlashcardData = {
      examples: mergedExampleData,
      studentExamples: mergedStudentExampleData,
    };

    const validatedMergedData = matchAndTrimArrays(mergedFlashcardData);

    return validatedMergedData;
  };

  const flashcardDataQuery = useQuery({
    queryKey: ['flashcardData', activeStudentId], // Data changes based on active student
    queryFn: getFlashcardData,
    staleTime: Infinity, // Never stale unless manually updated
    enabled: flashcardDataDependencies,
  });

  // Exported helper function to check if an example is collected by ID
  const exampleIsCollected = useCallback(
    (exampleId: number) => {
      const studentFlashcardData = flashcardDataQuery.data?.studentExamples;
      const foundStudentExample = studentFlashcardData?.find(
        (studentExample) => studentExample.relatedExample === exampleId,
      );
      return foundStudentExample !== undefined;
    },
    [flashcardDataQuery.data?.studentExamples],
  );

  const exampleIsCustom = useCallback(
    (exampleId: number) => {
      const studentFlashcardData = flashcardDataQuery.data?.studentExamples;
      const foundStudentExample = studentFlashcardData?.find(
        (studentExample) => studentExample.relatedExample === exampleId,
      );
      return foundStudentExample?.coachAdded || false;
    },
    [flashcardDataQuery.data?.studentExamples],
  );

  const exampleIsPending = useCallback(
    (exampleId: number) => {
      const studentFlashcardData = flashcardDataQuery.data?.studentExamples;
      const foundStudentExample = studentFlashcardData?.find(
        (studentExample) => studentExample.relatedExample === exampleId,
      );
      const studentExampleId = foundStudentExample?.recordId || -1;
      return studentExampleId < 0;
    },
    [flashcardDataQuery.data?.studentExamples],
  );

  // Create a ref to ensure refetch debounces properly
  const debouncedRefetch = useRef(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
    }, 500),
  ).current;

  // Function to return promise that will either give success data or throw an error.
  const addToActiveStudentFlashcards = useCallback(
    async (flashcard: Flashcard) => {
      const recordId = flashcard.recordId;
      let addPromise;
      if (
        (userDataQuery.data?.roles.adminRole === 'coach' ||
          userDataQuery.data?.roles.adminRole === 'admin') &&
        activeStudentId
      ) {
        addPromise = createStudentExample(activeStudentId, recordId);
      } else if (userDataQuery.data?.roles.studentRole === 'student') {
        addPromise = createMyStudentExample(recordId);
      }
      if (!addPromise) {
        throw new Error('No active student');
      }
      const addResponse = addPromise.then(
        (result: number | undefined | string) => {
          if (typeof result === 'string') {
            result = Number.parseInt(result);
          }
          if (result !== 1) {
            throw new Error('Failed to add Flashcard');
          }
          return result;
        },
      );
      return addResponse;
    },
    [
      userDataQuery.data?.roles,
      activeStudentId,
      createStudentExample,
      createMyStudentExample,
    ],
  );

  const addFlashcardMutation = useMutation({
    mutationFn: (flashcard: Flashcard) =>
      addToActiveStudentFlashcards(flashcard),
    onMutate: async (flashcard: Flashcard) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: ['flashcardData', activeStudentId],
      });

      // Memoize ID number for rollback, then decrement the tempIdNum for the next flashcard

      const getNextTempId = () => {
        let newId = -1;
        queryClient.setQueryData(['tempIdCounter'], (prevId: number = -1) => {
          const nextId = prevId - 1;
          newId = nextId;
          return nextId;
        });
        return newId;
      };

      const thisIdNum = getNextTempId();

      // Make placeholder record for student-example until backend responds
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const formattedTomorrow = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 1}`;

      // This needs checking. Types and date formats probably inaccurate.
      const newStudentExample: StudentExample = {
        studentEmailAddress: userDataQuery.data?.emailAddress || '',
        recordId: thisIdNum,
        relatedExample: flashcard.recordId,
        relatedStudent: activeStudentId!,
        dateCreated: formattedToday,
        lastReviewedDate: '',
        nextReviewDate: formattedTomorrow,
        reviewInterval: null,
        coachAdded: null,
      };

      // Optimistically update the flashcards cache
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          if (!oldFlashcards) {
            const newItem = {
              examples: [flashcard],
              studentExamples: [newStudentExample],
            };
            const trimmedNewFlashcardData = matchAndTrimArrays(newItem);
            return trimmedNewFlashcardData;
          }
          const oldFlashcardsCopy = [...oldFlashcards.examples];
          const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples];
          const newExampleArray = [
            ...oldFlashcardsCopy,
            { ...flashcard, isCollected: true },
          ];
          const newStudentExampleArray = [
            ...oldStudentFlashcardsCopy,
            newStudentExample,
          ];
          const newFlashcardData = {
            examples: newExampleArray,
            studentExamples: newStudentExampleArray,
          };
          const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData);
          return trimmedNewFlashcardData;
        },
      );
      return thisIdNum;
    },
    onSuccess: (_data, _variables) => {
      toast.success('Flashcard added successfully');
    },
    onError: (error, _variables, context) => {
      toast.error('Failed to add Flashcard');
      console.error(error);
      // Roll back the cache for just the affected flashcard
      // Use the memoized ID number to rollback the cache
      const thisIdNum = context;
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldFlashcardsCopy = [...oldFlashcards.examples];
          const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples];
          const newStudentExampleArray = oldStudentFlashcardsCopy.filter(
            (studentExample) => studentExample.recordId !== thisIdNum,
          );
          const newFlashcardData = {
            examples: oldFlashcardsCopy,
            studentExamples: newStudentExampleArray,
          };
          const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData);
          return trimmedNewFlashcardData;
        },
      );
    },
    // Always refetch after success or error:
    onSettled: () => debouncedRefetch(),
  });

  // Function to return promise that will either give success data or throw an error.
  const removeFromActiveStudentFlashcards = useCallback(
    async (flashcardId: number) => {
      const studentFlashcardId = flashcardDataQuery.data?.studentExamples.find(
        (studentFlashcard) => studentFlashcard.relatedExample === flashcardId,
      )?.recordId;
      if (!studentFlashcardId) {
        throw new Error('Flashcard Not Found');
      }
      let removePromise;
      if (
        (userDataQuery.data?.roles.adminRole === 'coach' ||
          userDataQuery.data?.roles.adminRole === 'admin') &&
        activeStudentId
      ) {
        removePromise = deleteStudentExample(studentFlashcardId);
      } else if (userDataQuery.data?.roles.studentRole === 'student') {
        removePromise = deleteMyStudentExample(studentFlashcardId);
      }
      if (!removePromise) {
        throw new Error('No active student');
      }
      const removeResponse = removePromise.then(
        (result: number | undefined | string) => {
          if (typeof result === 'string') {
            result = Number.parseInt(result);
          }
          if (result !== 1) {
            throw new Error('Failed to remove Flashcard');
          }
          return result;
        },
      );
      return removeResponse;
    },
    [
      userDataQuery.data?.roles,
      flashcardDataQuery.data,
      activeStudentId,
      deleteStudentExample,
      deleteMyStudentExample,
    ],
  );

  const removeFlashcardMutation = useMutation({
    mutationFn: (flashcardId: number) =>
      removeFromActiveStudentFlashcards(flashcardId),
    onMutate: async (flashcardId: number) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: ['flashcardData', activeStudentId],
      });

      // Memoize the studentFlashcard and flashcard objects for rollback
      let studentFlashcardObject: StudentExample | undefined;
      let flashcardObject: Flashcard | undefined;

      // Optimistically update the flashcards cache
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          // Find the studentFlashcard and related flashcard objects
          const flashcardObjectOriginal = oldFlashcards.examples.find(
            (flashcard) => flashcard.recordId === flashcardId,
          );
          const studentFlashcardObjectOriginal =
            oldFlashcards.studentExamples.find(
              (studentFlashcard) =>
                studentFlashcard.relatedExample === flashcardId,
            );

          // Make a copy if they exist, save to memoized objects
          studentFlashcardObject = studentFlashcardObjectOriginal
            ? { ...studentFlashcardObjectOriginal }
            : undefined;
          flashcardObject = flashcardObjectOriginal
            ? { ...flashcardObjectOriginal }
            : undefined;

          // Remove the studentFlashcard and related flashcard object from the cache
          const oldFlashcardsCopy = [...oldFlashcards.examples];
          const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples];
          const newStudentFlashcardsArray = oldStudentFlashcardsCopy.filter(
            (studentFlashcard) =>
              studentFlashcard.relatedExample !== flashcardId,
          );
          const newFlashcardsArray = oldFlashcardsCopy.filter(
            (flashcard) => flashcard.recordId !== flashcardId,
          );
          const newFlashcardData = {
            examples: newFlashcardsArray,
            studentExamples: newStudentFlashcardsArray,
          };
          const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData);
          return trimmedNewFlashcardData;
        },
      );
      // Return the memoized objects for rollback
      return { studentFlashcardObject, flashcardObject };
    },

    onSuccess: (_data, _variables, _context) => {
      toast.success('Flashcard removed successfully');
    },

    onError: (error, _variables, context) => {
      toast.error('Failed to remove Flashcard');
      console.error(error);
      // Roll back the cache for just the affected flashcard
      // Use the memoized objects to rollback the cache
      const studentFlashcardObject = context?.studentFlashcardObject;
      const flashcardObject = context?.flashcardObject;
      if (studentFlashcardObject?.recordId && flashcardObject?.recordId) {
        // Only run if the memoized objects exist
        queryClient.setQueryData(
          ['flashcardData', activeStudentId],
          (oldFlashcards: StudentFlashcardData) => {
            const flashcardsArray: Flashcard[] = [
              ...oldFlashcards?.examples,
              flashcardObject,
            ];
            const studentFlashcardsArray: StudentExample[] = [
              ...oldFlashcards?.studentExamples,
              studentFlashcardObject,
            ];
            const newFlashcardData = {
              examples: flashcardsArray,
              studentExamples: studentFlashcardsArray,
            };
            const trimmedNewFlashcardData =
              matchAndTrimArrays(newFlashcardData);
            return trimmedNewFlashcardData;
          },
        );
      }
    },
    onSettled: () => debouncedRefetch(),
  });

  const updateActiveStudentFlashcards = useCallback(
    async (studentExampleId: number, newInterval: number) => {
      let updatePromise;
      if (
        (userDataQuery.data?.roles.adminRole === 'coach' ||
          userDataQuery.data?.roles.adminRole === 'admin') &&
        activeStudentId
      ) {
        updatePromise = updateStudentExample(studentExampleId, newInterval);
      } else if (userDataQuery.data?.roles.studentRole === 'student') {
        updatePromise = updateMyStudentExample(studentExampleId, newInterval);
      }
      if (!updatePromise) {
        throw new Error('No active student');
      }
      const updateResponse = updatePromise.then(
        (result: number | undefined | string) => {
          if (typeof result === 'string') {
            result = Number.parseInt(result);
          }
          if (result !== studentExampleId) {
            throw new Error('Failed to update Flashcard');
          }
          return result;
        },
      );
      return updateResponse;
    },
    [
      userDataQuery.data?.roles,
      activeStudentId,
      updateStudentExample,
      updateMyStudentExample,
    ],
  );

  const updateFlashcardMutation = useMutation({
    mutationFn: ({
      studentExampleId,
      newInterval,
    }: {
      studentExampleId: number;
      newInterval: number;
      difficulty: 'easy' | 'hard';
    }) => updateActiveStudentFlashcards(studentExampleId, newInterval),
    onMutate: async ({ studentExampleId, newInterval, difficulty }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: ['flashcardData', activeStudentId],
      });

      // Memoize the old interval for rollback
      let oldInterval: number | undefined;

      // Optimistically update the flashcards cache
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldFlashcardsCopy = [...oldFlashcards.studentExamples];
          const studentFlashcard = oldFlashcardsCopy.find(
            (studentFlashcard) =>
              studentFlashcard.recordId === studentExampleId,
          );
          const flashcard = oldFlashcards.examples.find(
            (flashcard) =>
              flashcard.recordId === studentFlashcard?.relatedExample,
          );

          // Only update the cache if both are found
          if (studentFlashcard && flashcard) {
            oldInterval = studentFlashcard.reviewInterval
              ? studentFlashcard.reviewInterval
              : undefined;

            // Define new flashcard and studentFlashcard objects
            const newStudentFlashcard = {
              ...studentFlashcard,
              reviewInterval: newInterval,
            };
            const newFlashcard = { ...flashcard, difficulty };

            // Replace the flashcards in copy of array
            const newStudentFlashcardsArray = oldFlashcardsCopy.map(
              (studentFlashcard) =>
                studentFlashcard.recordId === studentExampleId
                  ? newStudentFlashcard
                  : studentFlashcard,
            );
            const newFlashcardsArray = oldFlashcards.examples.map(
              (flashcard) =>
                flashcard.recordId === studentFlashcard.relatedExample
                  ? newFlashcard
                  : flashcard,
            );

            // Trim the arrays to match
            const trimmedNewFlashcardData = matchAndTrimArrays({
              examples: newFlashcardsArray,
              studentExamples: newStudentFlashcardsArray,
            });
            return trimmedNewFlashcardData;
          }
        },
      );
      // Return the studentExampleId and the previous interval for rollback context
      return { studentExampleId, newInterval: oldInterval };
    },

    onSuccess: (_data, _variables) => {
      toast.success('Flashcard updated successfully');
    },

    onError: (error, _variables, context) => {
      toast.error('Failed to update Flashcard');
      console.error(error);
      // Make sure both necessary values are defined
      if (
        context?.studentExampleId === undefined ||
        context?.newInterval === undefined
      ) {
        return;
      }
      // Destructure the context
      const { studentExampleId, newInterval } = context;

      // Roll back the cache for just the affected flashcard
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldFlashcardsCopy = [...oldFlashcards.studentExamples];
          const studentFlashcard = oldFlashcardsCopy.find(
            (studentFlashcard) =>
              studentFlashcard.recordId === studentExampleId,
          );
          const flashcard = oldFlashcards.examples.find(
            (flashcard) =>
              flashcard.recordId === studentFlashcard?.relatedExample,
          );
          if (studentFlashcard && flashcard) {
            const newStudentFlashcard = {
              ...studentFlashcard,
              reviewInterval: newInterval,
            };
            const newFlashcard = { ...flashcard, difficulty: undefined };
            const newStudentFlashcardsArray = oldFlashcardsCopy.map(
              (studentFlashcard) =>
                studentFlashcard.recordId === studentExampleId
                  ? newStudentFlashcard
                  : studentFlashcard,
            );
            const newFlashcardsArray = oldFlashcards.examples.map(
              (flashcard) =>
                flashcard.recordId === studentFlashcard.relatedExample
                  ? newFlashcard
                  : flashcard,
            );
            const trimmedNewFlashcardData = matchAndTrimArrays({
              examples: newFlashcardsArray,
              studentExamples: newStudentFlashcardsArray,
            });
            return trimmedNewFlashcardData;
          }
          return oldFlashcards;
        },
      );
    },
    onSettled: () => debouncedRefetch(),
  });

  return {
    flashcardDataQuery,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
    addFlashcardMutation,
    removeFlashcardMutation,
    updateFlashcardMutation,
  };
}
