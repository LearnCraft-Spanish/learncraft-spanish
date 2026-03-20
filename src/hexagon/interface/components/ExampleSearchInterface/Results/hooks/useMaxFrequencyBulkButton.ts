import type { ExampleMaxFrequency } from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useCallback, useMemo } from 'react';

export interface UseMaxFrequencyBulkButtonReturn {
  allAlreadySelected: boolean;
  selectAllExamplesOnPage: () => void;
  selectedExampleIds: number[];
  clearSelectedExamples: () => void;
  addSelectedExample: (exampleId: number) => void;
  removeSelectedExample: (exampleId: number) => void;
}

export function useMaxFrequencyBulkButton(
  examples: ExampleMaxFrequency[],
): UseMaxFrequencyBulkButtonReturn {
  const {
    selectedExampleIds,
    updateSelectedExamples,
    addSelectedExample,
    removeSelectedExample,
    clearSelectedExamples,
  } = useSelectedExamplesContext();

  const allAlreadySelected = useMemo(() => {
    return examples.every((example) => selectedExampleIds.includes(example.id));
  }, [examples, selectedExampleIds]);

  const selectAllExamplesOnPage = useCallback(() => {
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
    selectedExampleIds,
    clearSelectedExamples,
    addSelectedExample,
    removeSelectedExample,
  };
}
