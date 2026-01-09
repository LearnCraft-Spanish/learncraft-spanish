// used outside hexagon, some places where it can be replaced with hexagon implementation or removed
import type {
  Flashcard,
  StudentExample,
  StudentFlashcardData,
} from 'src/types/interfaceDefinitions';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { toISODateTime } from 'src/hexagon/domain/functions/dateUtils';
import { useBackend } from 'src/hooks/useBackend';

export function useStudentFlashcards() {
  const queryClient = useQueryClient();
  const { isAuthenticated, authUser, isAdmin, isCoach, isStudent } =
    useAuthAdapter();
  const { appUser } = useActiveStudent();

  const userId = appUser?.recordId;
  const {
    getMyExamplesFromBackend,
    getActiveExamplesFromBackend,
    createStudentExample,
    createMyStudentExample,
    deleteStudentExample,
    deleteMyStudentExample,
    createMultipleStudentExamples,
  } = useBackend();

  // Temporary ID to generate unique placeholder keys for new flashcards
  // Initialize only if it doesn't exist
  if (queryClient.getQueryData(['tempIdCounter']) === undefined) {
    queryClient.setQueryData(['tempIdCounter'], -1);
  }

  // Abbreviated access since it's used frequently
  const activeStudentId = appUser?.recordId;

  // Dependency array for flashcardDataQuery
  const flashcardDataDependencies =
    isAuthenticated && !!appUser && !!activeStudentId;

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
        // Foreign Key lookup, form data in backend
        const match = studentExampleArray.find(
          (studentExample) =>
            studentExample.relatedExample === example.recordId,
        );
        return match;
      });
      const filteredStudentExamples = sortedStudentExamples.filter(
        (studentExample) => {
          // Foreign Key lookup, form data in backend
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

    if (!activeStudentId) {
      throw new Error('No active student');
    }

    if ((isAdmin || isCoach) && activeStudentId) {
      backendResponse = await getActiveExamplesFromBackend(activeStudentId);
    } else if (isStudent) {
      backendResponse = await getMyExamplesFromBackend();
    }

    if (!backendResponse) {
      throw new Error('Failed to get student flashcards; failed to fetch');
    }

    // Get the current cached data (previous session state)
    const previousData = queryClient.getQueryData<StudentFlashcardData>([
      'flashcardData',
      activeStudentId,
    ]);

    // Preserve the local "difficulty" status from previousData if it exists
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
      // Foreign Key lookup, form data in backend
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
      // Foreign Key lookup, form data in backend
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
      // Foreign Key lookup, form data in backend
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
      if ((isAdmin || isCoach) && activeStudentId) {
        addPromise = createStudentExample(activeStudentId, recordId);
      } else if (isStudent) {
        addPromise = createMyStudentExample(recordId);
      }
      if (!addPromise) {
        throw new Error('No active student');
      }
      const addResponse = async () => {
        const result: number[] | string[] | undefined = await addPromise;
        let createdId = result?.[0];
        if (typeof createdId === 'string') {
          createdId = Number.parseInt(createdId);
        }

        if (!createdId) {
          throw new Error('Failed to add Flashcard');
        }

        return createdId;
      };
      const data = await addResponse();

      return data;
    },
    [
      isAdmin,
      isCoach,
      isStudent,
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
      const fetchAndDecrementTempId = () => {
        let newId = -1;
        queryClient.setQueryData(['tempIdCounter'], (prevId: number = -1) => {
          const nextId = prevId - 1;
          newId = nextId;
          return nextId;
        });
        return newId;
      };

      const thisIdNum = fetchAndDecrementTempId();

      // Format exactly matches type as returned from database except for negative recordId
      const newStudentExample: StudentExample = {
        studentEmailAddress: authUser.email || '',
        recordId: thisIdNum,
        relatedExample: flashcard.recordId,
        relatedStudent: activeStudentId!,
        dateCreated: toISODateTime(),
        lastReviewedDate: '',
        nextReviewDate: '',
        reviewInterval: null,
        coachAdded: false,
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
          const newExampleArray = [
            ...oldFlashcards.examples,
            { ...flashcard, isCollected: true },
          ];
          const newStudentExampleArray = [
            ...oldFlashcards.studentExamples,
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

    onSuccess: (data, _variables, context) => {
      toast.success('Flashcard added successfully', { autoClose: 1000 });

      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldId = context;
          const newId = data;
          let newFlashcardData: StudentFlashcardData | null = null;
          const oldStudentExamples = oldFlashcards.studentExamples;
          const newStudentExample = oldStudentExamples.find(
            (studentExample) => studentExample.recordId === oldId,
          );
          if (!newStudentExample) {
            console.error('Error updating student example');
            return oldFlashcards;
          }
          if (newStudentExample) {
            const newStudentExampleArray = oldStudentExamples.map(
              (studentExample) =>
                studentExample.recordId === oldId
                  ? { ...studentExample, recordId: newId }
                  : studentExample,
            );
            const newUncheckedFlashcardData = {
              examples: oldFlashcards.examples,
              studentExamples: newStudentExampleArray,
            };
            newFlashcardData = matchAndTrimArrays(newUncheckedFlashcardData);
            return newFlashcardData;
          }
          return newFlashcardData;
        },
      );
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }); // refetch inside hexagon flashcard query
    },

    onError: (error, _variables, context) => {
      toast.error('Failed to add Flashcard', { autoClose: 1000 });
      console.error(error);
      // Roll back the cache for just the affected flashcard
      // Use the memoized ID number to rollback the cache
      const thisIdNum = context;
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldFlashcardsCopy = [...oldFlashcards.examples];
          const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples];
          // Foreign Key lookup, form data in backend
          const studentExampleToRemove = oldStudentFlashcardsCopy.find(
            (studentExample) => studentExample.recordId === thisIdNum,
          );
          // Foreign Key lookup, form data in backend
          const newStudentExampleArray = oldStudentFlashcardsCopy.filter(
            (studentExample) => studentExample.recordId !== thisIdNum,
          );
          // Foreign Key lookup, form data in backend
          const newExampleArray = oldFlashcardsCopy.filter(
            (example) =>
              example.recordId !== studentExampleToRemove?.relatedExample,
          );
          const newFlashcardData = {
            examples: newExampleArray,
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
      // Foreign Key lookup, form data in backend
      const studentFlashcardId = flashcardDataQuery.data?.studentExamples.find(
        (studentFlashcard) => studentFlashcard.relatedExample === flashcardId,
      )?.recordId;
      if (!studentFlashcardId) {
        throw new Error('Flashcard Not Found');
      }
      let removePromise;
      if ((isAdmin || isCoach) && activeStudentId) {
        removePromise = deleteStudentExample(studentFlashcardId);
      } else if (isStudent) {
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
      isAdmin,
      isCoach,
      isStudent,
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
          // Foreign Key lookup, form data in backend
          studentFlashcardObject = oldFlashcards.studentExamples.find(
            (studentFlashcard) =>
              studentFlashcard.relatedExample === flashcardId,
          );
          // Foreign Key lookup, form data in backend
          flashcardObject = oldFlashcards.examples.find(
            (flashcard) => flashcard.recordId === flashcardId,
          );

          // Remove the studentFlashcard and related flashcard object from the cache
          // Foreign Key lookup, form data in backend
          const newStudentFlashcardsArray =
            oldFlashcards.studentExamples.filter(
              (studentFlashcard) =>
                studentFlashcard.relatedExample !== flashcardId,
            );
          // Foreign Key lookup, form data in backend
          const newFlashcardsArray = oldFlashcards.examples.filter(
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

      // Return the memoized objects for rollback in case of error
      return { studentFlashcardObject, flashcardObject };
    },

    onSuccess: (_data, _variables, _context) => {
      toast.success('Flashcard removed successfully', { autoClose: 1000 });

      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }); // refetch inside hexagon flashcard query
    },

    onError: (error, _variables, context) => {
      toast.error('Failed to remove Flashcard', { autoClose: 1000 });
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

  // Function to return promise that will either give success data or throw an error.
  const addMultipleToActiveStudentFlashcards = useCallback(
    async (flashcards: Flashcard[]) => {
      const recordIds = flashcards.map((flashcard) => flashcard.recordId);
      let addPromise;
      if ((isAdmin || isCoach) && activeStudentId) {
        addPromise = createMultipleStudentExamples(activeStudentId, recordIds);
      } else if (isStudent) {
        // For students, we need to add them one by one since there's no bulk endpoint
        const results = await Promise.all(
          recordIds.map((recordId) => createMyStudentExample(recordId)),
        );
        return results.map((result) => {
          if (typeof result === 'string') {
            return Number.parseInt(result);
          }
          return result[0];
        });
      }
      if (!addPromise) {
        throw new Error('No active student');
      }
      const addResponse = async () => {
        const result = await addPromise;
        return result.map((id: number | string) => {
          if (typeof id === 'string') {
            return Number.parseInt(id);
          }
          return id;
        });
      };
      return addResponse();
    },
    [
      isAdmin,
      isCoach,
      isStudent,
      activeStudentId,
      createMyStudentExample,
      createMultipleStudentExamples,
    ],
  );

  interface AddMultipleFlashcardsContext {
    tempIds: number[];
    flashcards: Flashcard[];
  }

  const addMultipleFlashcardsMutation = useMutation<
    number[], // TData
    Error, // TError
    Flashcard[], // TVariables
    AddMultipleFlashcardsContext | undefined // TContext
  >({
    mutationFn: (flashcards: Flashcard[]) =>
      addMultipleToActiveStudentFlashcards(flashcards),
    onMutate: async (flashcards: Flashcard[]) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: ['flashcardData', activeStudentId],
      });

      // Generate temporary IDs for all flashcards
      const tempIds = flashcards.map(() => {
        let newId = -1;
        queryClient.setQueryData(['tempIdCounter'], (prevId: number = -1) => {
          const nextId = prevId - 1;
          newId = nextId;
          return nextId;
        });
        return newId;
      });

      // Format exactly matches type as returned from database except for negative recordIds
      const newStudentExamples: StudentExample[] = flashcards.map(
        (flashcard, index) => ({
          studentEmailAddress: authUser.email || '',
          recordId: tempIds[index],
          relatedExample: flashcard.recordId,
          relatedStudent: activeStudentId!,
          dateCreated: toISODateTime(),
          lastReviewedDate: '',
          nextReviewDate: '',
          reviewInterval: null,
          coachAdded: false,
        }),
      );

      // Optimistically update the flashcards cache
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          if (!oldFlashcards) {
            const newItem = {
              examples: flashcards,
              studentExamples: newStudentExamples,
            };
            const trimmedNewFlashcardData = matchAndTrimArrays(newItem);
            return trimmedNewFlashcardData;
          }
          const newExampleArray = [
            ...oldFlashcards.examples,
            ...flashcards.map((flashcard) => ({
              ...flashcard,
              isCollected: true,
            })),
          ];
          const newStudentExampleArray = [
            ...oldFlashcards.studentExamples,
            ...newStudentExamples,
          ];
          const newFlashcardData = {
            examples: newExampleArray,
            studentExamples: newStudentExampleArray,
          };
          const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData);
          return trimmedNewFlashcardData;
        },
      );

      return { tempIds, flashcards };
    },

    onSuccess: (
      data: number[],
      _variables: Flashcard[],
      context?: AddMultipleFlashcardsContext,
    ) => {
      if (!context) return;
      const { tempIds } = context;
      const successCount = data.filter(
        (id: number | string) => Number(id) > 0,
      ).length;
      const totalCount = data.length;

      if (successCount === totalCount) {
        toast.success('All flashcards added successfully', { autoClose: 1000 });
      } else {
        toast.success(
          `Added ${successCount} of ${totalCount} flashcards successfully`,
          { autoClose: 1000 },
        );
      }

      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldStudentExamples = oldFlashcards.studentExamples;
          const newStudentExampleArray = oldStudentExamples.map(
            (studentExample) => {
              const tempIdIndex = tempIds.indexOf(studentExample.recordId);
              if (tempIdIndex !== -1) {
                const newId = data[tempIdIndex];
                if (newId > 0) {
                  return { ...studentExample, recordId: newId };
                }
              }
              return studentExample;
            },
          );
          const newFlashcardData = {
            examples: oldFlashcards.examples,
            studentExamples: newStudentExampleArray,
          };
          return matchAndTrimArrays(newFlashcardData);
        },
      );
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }); // refetch inside hexagon flashcard query
    },

    onError: (
      error: Error,
      _variables: Flashcard[],
      context?: AddMultipleFlashcardsContext,
    ) => {
      toast.error('Failed to add some flashcards', { autoClose: 1000 });
      console.error(error);
      if (!context) return;
      // Roll back the cache for just the affected flashcards
      const { tempIds } = context;
      queryClient.setQueryData(
        ['flashcardData', activeStudentId],
        (oldFlashcards: StudentFlashcardData) => {
          const oldFlashcardsCopy = [...oldFlashcards.examples];
          const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples];
          // Foreign Key lookup, form data in backend
          const newStudentExampleArray = oldStudentFlashcardsCopy.filter(
            (studentExample) => !tempIds.includes(studentExample.recordId),
          );
          const newExampleArray = oldFlashcardsCopy.filter(
            (example) =>
              !newStudentExampleArray.some(
                (studentExample) =>
                  studentExample.relatedExample === example.recordId,
              ),
          );
          const newFlashcardData = {
            examples: newExampleArray,
            studentExamples: newStudentExampleArray,
          };
          return matchAndTrimArrays(newFlashcardData);
        },
      );
    },
    // Always refetch after success or error:
    onSettled: () => debouncedRefetch(),
  });

  return {
    flashcardDataQuery,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
    addFlashcardMutation,
    addMultipleFlashcardsMutation,
    removeFlashcardMutation,
  };
}
