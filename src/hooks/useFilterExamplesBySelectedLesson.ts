import type { Flashcard } from 'src/types/interfaceDefinitions';
import { useCallback, useMemo } from 'react';
import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';
import { useProgramTable } from './CourseData/useProgramTable'; // Assuming this fetches the programs data

export function useFilterExamplesBySelectedLesson() {
  const { programTableQuery } = useProgramTable(); // Fetch the programs data internally
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();

  // Function to get the allowed vocabulary from the 'to' lesson
  const allowedVocabulary = useMemo((): string[] => {
    let allowedVocabulary: string[] = [];
    const program = programTableQuery.data?.find(
      (item) => item.recordId === course?.id,
    );
    const foundLesson = program?.lessons.find(
      (item) => item.recordId === toLesson?.id,
    );
    if (foundLesson) {
      allowedVocabulary = foundLesson.vocabKnown || [];
    }
    return allowedVocabulary;
  }, [course, toLesson, programTableQuery.data]);

  // Function to get the required vocabulary from the 'from' lesson
  const requiredVocabulary = useMemo((): string[] => {
    let requiredVocabulary: string[] = [];
    const program = programTableQuery.data?.find(
      (item) => item.recordId === course?.id,
    );
    const foundFromLesson = program?.lessons.find(
      (item) => item.recordId === fromLesson?.id,
    );
    const foundToLesson = program?.lessons.find(
      (item) => item.recordId === toLesson?.id,
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

    return requiredVocabulary;
  }, [course, fromLesson, toLesson, programTableQuery.data]);

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
      if (!requiredVocabulary.length && !fromLesson) {
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
    [allowedVocabulary, requiredVocabulary, fromLesson],
  );
  // Expose current state, vocab, and filtering function
  return {
    allowedVocabulary,
    requiredVocabulary,
    filterExamplesBySelectedLesson,
  };
}
