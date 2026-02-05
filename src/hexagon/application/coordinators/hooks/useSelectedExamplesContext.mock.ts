import type { SelectedExamplesContextType } from '@application/coordinators/contexts/SelectedExamplesContext';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

// Create a default mock implementation
const defaultMockImplementation: SelectedExamplesContextType = {
  selectedExampleIds: [],
  updateSelectedExamples: vi.fn<() => void>(),
  addSelectedExample: vi.fn<() => void>(),
  removeSelectedExample: vi.fn<() => void>(),
  clearSelectedExamples: vi.fn<() => void>(),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseSelectedExamplesContext,
  override: overrideMockUseSelectedExamplesContext,
  reset: resetMockUseSelectedExamplesContext,
} = createOverrideableMock<() => SelectedExamplesContextType>(
  () => defaultMockImplementation,
);

// Export the default mock implementation for convenience
export { defaultMockImplementation };
