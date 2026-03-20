import type { ExampleMaxFrequency } from '@learncraft-spanish/shared';
import { createMockExampleMaxFrequencyList } from '@testing/factories/exampleFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

interface UseExamplesByMaxFrequencyReturn {
  examples: ExampleMaxFrequency[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const defaultReturn: UseExamplesByMaxFrequencyReturn = {
  examples: createMockExampleMaxFrequencyList(5),
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseExamplesByMaxFrequency,
  override: overrideMockUseExamplesByMaxFrequency,
  reset: resetMockUseExamplesByMaxFrequency,
} = createOverrideableMockHook<
  [
    params: {
      highestFirst: boolean;
      vocabularyComplete?: boolean;
      spanglish?: 'all' | 'only-spanglish' | 'no-spanglish';
    },
  ],
  UseExamplesByMaxFrequencyReturn
>(defaultReturn);

