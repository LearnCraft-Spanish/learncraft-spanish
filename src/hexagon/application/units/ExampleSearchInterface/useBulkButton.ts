import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useCallback, useMemo } from 'react';
export function useBulkButton(examples: ExampleWithVocabulary[]) {
  const { selectedExampleIds, updateSelectedExamples } =
    useSelectedExamplesContext();
  // function to select all examples on page
  const allAlreadySelected = useMemo(() => {
    return examples?.every((example) =>
      selectedExampleIds.includes(example.id),
    );
  }, [examples, selectedExampleIds]);
  const selectAllExamplesOnPage = useCallback(() => {
    if (!examples) return;
    const newSelection = [
      ...selectedExampleIds,
      ...examples
        .filter((example) => !selectedExampleIds.includes(example.id))
        .map((example) => example.id),
    ];
    updateSelectedExamples(newSelection);
  }, [examples, selectedExampleIds, updateSelectedExamples]);

  return {
    allAlreadySelected,
    selectAllExamplesOnPage,
  };
}
