import type { UpdateExampleRecord } from '@LearnCraft-Spanish/shared';
import { useExamplesAdapter } from '@application/adapters/examplesAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export function useSingleExample(exampleId: number) {
  const adapter = useExamplesAdapter();

  const query = useQuery({
    queryKey: ['singleExample', exampleId],
    queryFn: () => adapter.getExample(exampleId),
    ...queryDefaults.referenceData,
  });

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

  return {
    query,
    handleUpdateExample,
    handleAddVocabularyToExample,
    handleRemoveVocabularyFromExample,
  };
}
