import {
  mockUseSelectedExamplesContext,
  overrideMockUseSelectedExamplesContext,
  resetMockUseSelectedExamplesContext,
} from '@application/coordinators/hooks/useSelectedExamplesContext.mock';
import { useMaxFrequencyBulkButton } from '@application/useCases/ExampleSearch/useMaxFrequencyBulkButton';
import { renderHook } from '@testing-library/react';
import { createMockExampleMaxFrequencyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: vi.fn(() => mockUseSelectedExamplesContext),
}));

describe('useMaxFrequencyBulkButton', () => {
  beforeEach(() => {
    resetMockUseSelectedExamplesContext();
  });

  it('returns allAlreadySelected true when all examples are selected', () => {
    const examples = createMockExampleMaxFrequencyList(2);
    const selectedExampleIds = examples.map((example) => example.id);

    overrideMockUseSelectedExamplesContext({
      selectedExampleIds,
    });

    const { result } = renderHook(() => useMaxFrequencyBulkButton(examples));

    expect(result.current.allAlreadySelected).toBe(true);
    expect(result.current.selectedExampleIds).toEqual(selectedExampleIds);
  });

  it('selectAllExamplesOnPage deduplicates and appends missing ids', () => {
    const examples = createMockExampleMaxFrequencyList(3);
    examples[0].id = 10;
    examples[1].id = 20;
    examples[2].id = 30;
    const firstId = examples[0].id;
    const updateSelectedExamples = vi.fn();

    overrideMockUseSelectedExamplesContext({
      selectedExampleIds: [firstId, 99999],
      updateSelectedExamples,
    });

    const { result } = renderHook(() => useMaxFrequencyBulkButton(examples));
    result.current.selectAllExamplesOnPage();

    expect(updateSelectedExamples).toHaveBeenCalledWith([
      firstId,
      99999,
      examples[1].id,
      examples[2].id,
    ]);
  });
});
