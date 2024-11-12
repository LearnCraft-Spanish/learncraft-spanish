import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { Flashcard, Lesson, Program } from '../interfaceDefinitions';
import { useActiveStudent } from './useActiveStudent';
import { useProgramTable } from './useProgramTable'; // Assuming this fetches the programs data

interface SelectionState {
  program: Program | null;
  fromLesson: Lesson | null;
  toLesson: Lesson | null;
}

function getLessonNumber(lesson: Lesson | null) {
  const lessonName = lesson?.lesson;
  if (!lessonName) {
    return null;
  }
  const lessonArray = lessonName.split(' ');
  const lastElement = lessonArray[lessonArray.length - 1];
  return Number.parseInt(lastElement);
}

function deserializeSelection(
  lessonSelectionString: string | null,
  programs: Program[] | undefined,
): SelectionState {
  const splitString = lessonSelectionString?.split('-') ?? [];
  const programId = splitString[0];
  const toLessonNumber =
    splitString.length > 1 ? splitString[splitString.length - 1] : null;
  const fromLessonNumber = splitString.length > 2 ? splitString[1] : null;
  const program =
    programs?.find((item) => item.recordId === Number(programId)) || null;
  const fromLesson =
    program?.lessons.find(
      (item) => getLessonNumber(item) === Number(fromLessonNumber),
    ) || null;
  const toLesson =
    program?.lessons.find(
      (item) => getLessonNumber(item) === Number(toLessonNumber),
    ) || null;
  return { program, fromLesson, toLesson };
}

function serializeNewSelection(newSelection: SelectionState): string {
  const program = newSelection.program?.recordId || null;
  const fromLesson = getLessonNumber(newSelection?.fromLesson);
  const toLesson = getLessonNumber(newSelection?.toLesson);
  const numberArray = [program, fromLesson, toLesson];
  const filteredArray = numberArray.filter((item) => !!item);
  const stringified = filteredArray.join('-');
  return stringified;
}

export function useSelectedLesson() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeProgram, activeLesson } = useActiveStudent(); // Fetch the active student
  const { programTableQuery } = useProgramTable(); // Fetch the programs data internally

  const programsQueryData = programTableQuery.data;

  const defaultSelection: SelectionState = useMemo(() => {
    return { program: activeProgram, fromLesson: null, toLesson: activeLesson };
  }, [activeProgram, activeLesson]);

  const lessonSelection = useMemo(() => {
    const selectionString = searchParams.get('lessonSelection');
    const deserialized = deserializeSelection(
      selectionString,
      programsQueryData,
    );
    const activeOverride =
      deserialized.program?.recordId === defaultSelection.program?.recordId &&
      !deserialized.toLesson;
    if (!deserialized.program || activeOverride) {
      return defaultSelection;
    }
    return deserialized;
  }, [searchParams, programsQueryData, defaultSelection]);

  const updateSearchParams = useCallback(
    (newSelection: SelectionState) => {
      const currentSelection = searchParams.get('lessonSelection');
      const serializedSelection = serializeNewSelection(newSelection);
      if (serializedSelection !== currentSelection) {
        const newSearchParams = new URLSearchParams(searchParams);
        if (serializedSelection) {
          newSearchParams.set('lessonSelection', serializedSelection);
        } else {
          newSearchParams.delete('lessonSelection');
        }
        setSearchParams(newSearchParams);
      }
    },
    [searchParams, setSearchParams],
  );

  // Set selected program
  const setProgram = useCallback(
    (programId: number | string | null) => {
      if (typeof programId === 'string') {
        programId = Number.parseInt(programId) || null;
      }
      const newProgram =
        programsQueryData?.find((item) => item.recordId === programId) || null;
      if (newProgram !== lessonSelection.program) {
        const newSelection = {
          program: newProgram,
          fromLesson: null,
          toLesson: null,
        };
        updateSearchParams(newSelection);
      }
    },
    [programsQueryData, lessonSelection, updateSearchParams],
  );

  // Set 'from' lesson
  const setFromLesson = useCallback(
    (newId: number | string | null) => {
      if (typeof newId === 'string') {
        newId = Number.parseInt(newId) || null;
      }
      const newFromLesson =
        lessonSelection.program?.lessons.find(
          (item) => item.recordId === newId,
        ) || null;
      if (lessonSelection.toLesson) {
        updateSearchParams({ ...lessonSelection, fromLesson: newFromLesson });
      }
    },
    [lessonSelection, updateSearchParams],
  );

  // Set 'to' lesson
  const setToLesson = useCallback(
    (newId: number | string | null) => {
      if (typeof newId === 'string') {
        newId = Number.parseInt(newId) || null;
      }
      const newToLesson =
        lessonSelection.program?.lessons.find(
          (item) => item.recordId === newId,
        ) || null;
      if (!newToLesson) {
        updateSearchParams({
          ...lessonSelection,
          fromLesson: null,
          toLesson: null,
        });
      } else {
        updateSearchParams({ ...lessonSelection, toLesson: newToLesson });
      }
    },
    [lessonSelection, updateSearchParams],
  );

  // Function to get the allowed vocabulary from the 'to' lesson
  const allowedVocabulary = useMemo((): string[] => {
    let allowedVocabulary: string[] = [];
    const program = lessonSelection.program;
    if (program) {
      const foundLesson = program.lessons.find(
        (item) => item.recordId === lessonSelection.toLesson?.recordId,
      );
      if (foundLesson) {
        allowedVocabulary = foundLesson.vocabKnown || [];
      } else {
        allowedVocabulary =
          program.lessons[program.lessons.length - 1]?.vocabKnown || [];
      }
    }
    return allowedVocabulary;
  }, [lessonSelection.program, lessonSelection.toLesson?.recordId]);

  // Function to get the required vocabulary from the 'from' lesson
  const requiredVocabulary = useMemo((): string[] => {
    let requiredVocabulary: string[] = [];
    const program = lessonSelection.program;
    if (program) {
      const foundFromLesson = program.lessons.find(
        (item) => item.recordId === lessonSelection.fromLesson?.recordId,
      );
      const foundToLesson = program.lessons.find(
        (item) => item.recordId === lessonSelection.toLesson?.recordId,
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
    lessonSelection.fromLesson?.recordId,
    lessonSelection.program,
    lessonSelection.toLesson?.recordId,
  ]);

  // Function to filter flashcards by allowed vocabulary
  const filterExamplesBySelectedLesson = useCallback(
    (examples: Flashcard[]): Flashcard[] => {
      if (!lessonSelection.program || !lessonSelection.toLesson) {
        return examples;
      }
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
      let filteredByRequired = filteredByAllowedVocab;
      if (requiredVocabulary.length > 0) {
        filteredByRequired = filteredByAllowedVocab.filter((item) => {
          let isRequired = false;
          item.vocabIncluded.forEach((word) => {
            if (requiredVocabulary.includes(word)) {
              isRequired = true;
            }
          });
          return isRequired;
        });
      }
      return filteredByRequired;
    },
    [allowedVocabulary, lessonSelection, requiredVocabulary],
  );

  // Expose current state, vocab, and filtering function
  return {
    selectedProgram: lessonSelection?.program,
    selectedFromLesson: lessonSelection?.fromLesson,
    selectedToLesson: lessonSelection?.toLesson,
    allowedVocabulary,
    requiredVocabulary,
    setProgram,
    setFromLesson,
    setToLesson,
    filterExamplesBySelectedLesson,
  };
}
