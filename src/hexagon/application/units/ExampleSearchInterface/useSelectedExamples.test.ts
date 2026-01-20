import {
  mockUseSelectedExamplesContext,
  overrideMockUseSelectedExamplesContext,
} from '@application/coordinators/hooks/useSelectedExamplesContext.mock';
import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { testQueryClient } from '@testing/utils/testQueryClient';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: vi.fn(() => mockUseSelectedExamplesContext),
}));

describe('useSelectedExamples', () => {
  beforeEach(() => {
    testQueryClient.clear();
    vi.clearAllMocks();
  });

  it('should return selected examples from cached query data', () => {
    // Create mock examples
    const mockExamples = createMockExampleWithVocabularyList(5);
    const selectedIds = [mockExamples[0].id, mockExamples[2].id];

    // Mock the context to return selected IDs
    overrideMockUseSelectedExamplesContext({
      selectedExampleIds: selectedIds,
    });

    // Add examples to the query cache with key 'examples'
    testQueryClient.setQueryData(['examples'], mockExamples);

    // Render the hook
    const { result } = renderHook(() => useSelectedExamples(), {
      wrapper: TestQueryClientProvider,
    });

    // Verify it returns the correct selected examples
    expect(result.current.selectedExamples).toHaveLength(2);
    expect(result.current.selectedExamples[0].id).toBe(mockExamples[0].id);
    expect(result.current.selectedExamples[1].id).toBe(mockExamples[2].id);
  });

  it('should return empty array when no examples are selected', () => {
    const mockExamples = createMockExampleWithVocabularyList(5);

    // Mock the context with no selected IDs
    overrideMockUseSelectedExamplesContext({
      selectedExampleIds: [],
    });

    testQueryClient.setQueryData(['examples'], mockExamples);

    const { result } = renderHook(() => useSelectedExamples(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.selectedExamples).toEqual([]);
  });

  it('should handle examples cached in nested object structure', () => {
    const mockExamples = createMockExampleWithVocabularyList(3);
    const selectedIds = [mockExamples[1].id];

    overrideMockUseSelectedExamplesContext({
      selectedExampleIds: selectedIds,
    });

    // Cache data in the nested format { examples: [...] }
    testQueryClient.setQueryData(['examples', 'search'], {
      examples: mockExamples,
    });

    const { result } = renderHook(() => useSelectedExamples(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.selectedExamples).toHaveLength(1);
    expect(result.current.selectedExamples[0].id).toBe(mockExamples[1].id);
  });
});
