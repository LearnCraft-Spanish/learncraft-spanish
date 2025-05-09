import type {
  Flashcard,
  Lesson,
  Program,
} from 'src/types/interfaceDefinitions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useProgramTable } from './CourseData/useProgramTable'; // Assuming this fetches the programs data
import { useActiveStudent } from './UserData/useActiveStudent';

export function useSelectedLesson() {
  const queryClient = useQueryClient();
  const { activeStudentQuery, activeProgram, activeLesson } =
    useActiveStudent(); // Fetch the active student
  const { programTableQuery } = useProgramTable(); // Fetch the programs data internally

  const programsQueryData = programTableQuery.data;

  // Default initial state for selected program and lessons
  const initialSelectionState = {
    program: null as Program | null,
    fromLesson: null as Lesson | null,
    toLesson: null as Lesson | null,
  };

  // Function to get the initial selection state
  const getSelectionState = () => initialSelectionState;

  // Fetch the current selected program and lessons
  const { data: selectionState } = useQuery({
    queryKey: ['programSelection'],
    queryFn: getSelectionState,
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: initialSelectionState,
    enabled: !!programTableQuery.data,
  });

  // Function to get the allowed vocabulary from the 'to' lesson
  const allowedVocabulary = useMemo((): string[] => {
    let allowedVocabulary: string[] = [];
    const program = selectionState.program;
    if (program) {
      // Foreign Key lookup, form data in backend?
      const foundLesson = program.lessons.find(
        (item) => item.recordId === selectionState.toLesson?.recordId,
      );
      if (foundLesson) {
        allowedVocabulary = foundLesson.vocabKnown || [];
      }
    }
    return allowedVocabulary;
  }, [selectionState.program, selectionState.toLesson?.recordId]);

  // Function to get the required vocabulary from the 'from' lesson
  const requiredVocabulary = useMemo((): string[] => {
    let requiredVocabulary: string[] = [];
    const program = selectionState.program;
    if (program) {
      // Foreign Key lookup, form data in backend?
      const foundFromLesson = program.lessons.find(
        (item) => item.recordId === selectionState.fromLesson?.recordId,
      );
      // Foreign Key lookup, form data in backend?
      const foundToLesson = program.lessons.find(
        (item) => item.recordId === selectionState.toLesson?.recordId,
      );
      if (foundFromLesson && foundToLesson) {
        const allToVocab = foundToLesson.vocabKnown || [];
        const allFromVocab = foundFromLesson.vocabKnown || [];
        const newFromVocab = foundFromLesson.vocabIncluded || [];
        const oldVocab = allFromVocab.filter(
          (word) => !newFromVocab.includes(word),
        );
        requiredVocabulary = allToVocab.filter(
          (word) => !oldVocab.includes(word),
        );
      }
    }
    return requiredVocabulary;
  }, [
    selectionState.fromLesson?.recordId,
    selectionState.program,
    selectionState.toLesson?.recordId,
  ]);

  // Function to filter flashcards by allowed vocabulary
  const filterExamplesBySelectedLesson = useCallback(
    (examples: Flashcard[]): Flashcard[] => {
      // Foreign Key lookup, form data in backend?
      const filteredByAllowedVocab = examples.filter((item) => {
        let isAllowed =
          item.vocabIncluded.length > 0 && item.vocabComplete !== false;
        item.vocabIncluded.forEach((word) => {
          if (!allowedVocabulary.includes(word)) {
            isAllowed = false;
          }
        });
        return isAllowed;
      });
      if (!requiredVocabulary.length && !selectionState.fromLesson) {
        return filteredByAllowedVocab;
      }
      if (!requiredVocabulary.length) {
        return [];
      }
      // Foreign Key lookup, form data in backend?
      return filteredByAllowedVocab.filter((item) => {
        let isRequired = false;
        item.vocabIncluded.forEach((word) => {
          if (requiredVocabulary.includes(word)) {
            isRequired = true;
          }
        });
        return isRequired;
      });
    },
    [allowedVocabulary, requiredVocabulary, selectionState.fromLesson],
  );

  const newToLesson = useCallback(
    (program: Program | null) => {
      const firstLesson = program?.lessons[0] || null;
      if (activeLesson?.recordId) {
        // Foreign Key lookup, form data in backend?
        const foundLesson = program?.lessons.find(
          (lesson) => lesson.recordId === activeLesson.recordId,
        );
        if (foundLesson) {
          return foundLesson;
        }
        return firstLesson;
      }
      return firstLesson;
    },
    [activeLesson],
  );

  // Set selected program
  const setProgram = useCallback(
    (program: number | string | null) => {
      if (typeof program === 'string') {
        program = Number.parseInt(program);
      }
      const newProgram =
        programsQueryData?.find((item) => item.recordId === program) || null;
      if (!newProgram?.recordId) {
        queryClient.setQueryData(
          ['programSelection'],
          (oldState: typeof initialSelectionState) => ({
            ...oldState,
            program: null,
            fromLesson: null,
            toLesson: null,
          }),
        );
        return;
      }
      queryClient.setQueryData(
        ['programSelection'],
        (oldState: typeof initialSelectionState) => ({
          ...oldState,
          program: newProgram,
          fromLesson: null,
          toLesson: newToLesson(newProgram),
        }),
      );
    },
    [programsQueryData, newToLesson, queryClient],
  );

  // Set 'from' lesson
  const setFromLesson = useCallback(
    (newId: number | string | null) => {
      if (typeof newId === 'string') {
        newId = Number.parseInt(newId);
      }
      // Foreign Key lookup, form data in backend?
      const newFromLesson = selectionState.program?.lessons.find(
        (item) => item.recordId === newId,
      );
      if (!newFromLesson?.recordId) {
        queryClient.setQueryData(
          ['programSelection'],
          (oldState: typeof initialSelectionState) => ({
            ...oldState,
            fromLesson: null,
          }),
        );
      }
      queryClient.setQueryData(
        ['programSelection'],
        (oldState: typeof initialSelectionState) => ({
          ...oldState,
          fromLesson: newFromLesson,
        }),
      );
    },
    [selectionState.program, queryClient],
  );

  // Set 'to' lesson
  const setToLesson = useCallback(
    (toLesson: number | string | null) => {
      if (typeof toLesson === 'string') {
        toLesson = Number.parseInt(toLesson);
      }
      // Foreign Key lookup, form data in backend?
      const newToLesson = selectionState.program?.lessons.find(
        (item) => item.recordId === toLesson,
      );
      if (!newToLesson?.recordId) {
        queryClient.setQueryData(
          ['programSelection'],
          (oldState: typeof initialSelectionState) => ({
            ...oldState,
            toLesson: null,
          }),
        );
      }
      queryClient.setQueryData(
        ['programSelection'],
        (oldState: typeof initialSelectionState) => ({
          ...oldState,
          toLesson: newToLesson,
        }),
      );
    },
    [selectionState.program, queryClient],
  );

  // Update program when activeStudent changes
  useEffect(() => {
    if (activeStudentQuery.data && activeProgram?.recordId) {
      setProgram(activeProgram.recordId);
    }
  }, [activeStudentQuery.data, activeProgram?.recordId, setProgram]);

  // Expose current state, vocab, and filtering function
  return {
    selectedProgram: selectionState?.program,
    selectedFromLesson: selectionState?.fromLesson,
    selectedToLesson: selectionState?.toLesson,
    allowedVocabulary,
    requiredVocabulary,
    setProgram,
    setFromLesson,
    setToLesson,
    filterExamplesBySelectedLesson,
  };
}
