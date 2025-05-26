import type { UpdateExampleRecord } from '@LearnCraft-Spanish/shared';
import type { ExampleRecord } from '@LearnCraft-Spanish/shared/dist/domain/examples/core-types';
import type { UseQueryResult } from '@tanstack/react-query';

import { useExamplesAdapter } from 'src/hexagon/application/adapters/examplesAdapter';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';

import {
  checkExampleRecordChanges,
  vocabIdsToAddHelper,
  vocabIdsToRemoveHelper,
} from '../helpers/exampleChanges';

export function useUpdateExampleFromQuery() {
  const adapter = useExamplesAdapter();
  const { vocabularyQuery } = useVocabulary();

  // These are our functions that call the backend
  function handleUpdateExample(example: UpdateExampleRecord) {
    adapter.updateExample(example);
  }

  function handleAddVocabularyToExample(
    exampleId: number,
    vocabIdList: number[],
  ) {
    adapter.addVocabularyToExample(exampleId, vocabIdList);
  }

  function handleRemoveVocabularyFromExample(
    exampleId: number,
    vocabIdList: number[],
  ) {
    adapter.removeVocabularyFromExample(exampleId, vocabIdList);
  }

  async function updateExampleFromQuery(
    newExampleData: UpdateExampleRecord,
    vocabIncluded: string[],
    query: UseQueryResult<ExampleRecord[], Error>,
  ) {
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

    const oldVocabIncluded = oldExampleData?.vocabIncluded ?? [];

    if (!oldExampleData) {
      throw new Error('Old example data not found.');
    }

    console.log('oldExampleData', oldExampleData);
    const hasChanged = checkExampleRecordChanges(
      oldExampleData,
      newExampleData,
    );
    const vocabIdsToAdd = vocabIdsToAddHelper(
      oldVocabIncluded,
      vocabIncluded,
      vocabMap,
    );
    console.log('vocabIdsToAdd', vocabIdsToAdd);
    const vocabIdsToRemove = vocabIdsToRemoveHelper(
      oldVocabIncluded,
      vocabIncluded,
      vocabMap,
    );
    if (
      !hasChanged &&
      vocabIdsToAdd.length === 0 &&
      vocabIdsToRemove.length === 0
    ) {
      console.error('No changes detected.');
      return;
    }
    try {
      // Run add and remove concurrently
      const promises = Promise.all([
        vocabIdsToAdd.length
          ? handleAddVocabularyToExample(newExampleData.recordId, vocabIdsToAdd)
          : Promise.resolve(),
        vocabIdsToRemove.length
          ? handleRemoveVocabularyFromExample(
              newExampleData.recordId,
              vocabIdsToRemove,
            )
          : Promise.resolve(),
      ]);

      // Wait for vocab operations to complete before updating the example
      await promises;

      hasChanged
        ? await handleUpdateExample(newExampleData)
        : Promise.resolve();
    } catch (error) {
      console.error('Failed to update quiz example:', error);
    } finally {
      // Ensure refetch is only called after all operations are complete
      // add half second timeout
      setTimeout(() => {
        query.refetch();
      }, 500);
    }
  }

  return { updateExampleFromQuery };
}
