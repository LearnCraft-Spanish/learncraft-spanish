import type { Flashcard } from 'src/types/interfaceDefinitions';
import type { UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBackend } from 'src/hooks/useBackend';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';

export const useExampleUpdate = () => {
  const { vocabularyQuery } = useVocabulary();
  const { updateExample, addVocabularyToExample, removeVocabFromExample } =
    useBackend();

  const updateExampleFromQuery = useCallback(
    (newExampleData: Flashcard, query: UseQueryResult<Flashcard[], Error>) => {
      if (!vocabularyQuery.data) {
        throw new Error('Vocabulary data is not ready.');
      }

      // Precompute vocabName -> recordId map
      const vocabMap = new Map(
        vocabularyQuery.data.map((vocab) => [vocab.vocabName, vocab.recordId]),
      );

      const oldExampleData = query.data?.find(
        (example) => example.recordId === newExampleData.recordId,
      );

      if (!oldExampleData) {
        throw new Error('Old example data not found.');
      }

      function checkChange() {
        const oldExampleCopy: Flashcard = { ...oldExampleData! };
        const newExampleCopy: Flashcard = { ...newExampleData };
        const emptySet: string[] = [];
        oldExampleCopy.vocabIncluded = emptySet;
        newExampleCopy.vocabIncluded = emptySet;
        oldExampleCopy.dateCreated = undefined;
        oldExampleCopy.dateModified = undefined;
        newExampleCopy.dateCreated = undefined;
        newExampleCopy.dateModified = undefined;
        const keys = Object.keys(oldExampleCopy) as (keyof Flashcard)[];
        for (const key of keys) {
          if (oldExampleCopy[key] !== newExampleCopy[key]) {
            return true;
          }
        }
        return false;
      }

      const hasChanged = checkChange();

      const oldVocab = oldExampleData.vocabIncluded;
      const newVocab = newExampleData.vocabIncluded;

      const vocabToAdd = newVocab.filter((vocab) => !oldVocab.includes(vocab));
      const vocabToRemove = oldVocab.filter(
        (vocab) => !newVocab.includes(vocab),
      );

      const vocabIdsToAdd = vocabToAdd
        .map((vocab) => {
          const recordId = vocabMap.get(vocab);
          if (!recordId) console.error(`Vocab "${vocab}" not found.`);
          return recordId;
        })
        .filter((id) => id !== undefined) as number[];

      const vocabIdsToRemove = vocabToRemove
        .map((vocab) => vocabMap.get(vocab))
        .filter((id) => id !== undefined) as number[];

      if (
        !hasChanged &&
        vocabIdsToAdd.length === 0 &&
        vocabIdsToRemove.length === 0
      ) {
        console.error('No changes detected.');
        return;
      }

      const updateExampleData = async () => {
        if (hasChanged) {
          return updateExample(newExampleData);
        }
      };

      const addVocab = async () => {
        if (!vocabIdsToAdd.length) {
          return;
        }
        addVocabularyToExample(newExampleData.recordId, vocabIdsToAdd);
      };

      const removeVocab = async () => {
        if (!vocabIdsToRemove.length) {
          return;
        }
        removeVocabFromExample(newExampleData.recordId, vocabIdsToRemove);
      };

      try {
        Promise.all([updateExampleData(), addVocab(), removeVocab()]);
      } catch (error) {
        console.error('Failed to update quiz example:', error);
      }
      query.refetch();
    },
    [
      updateExample,
      addVocabularyToExample,
      removeVocabFromExample,
      vocabularyQuery.data,
    ],
  );

  return { updateExampleFromQuery };
};
