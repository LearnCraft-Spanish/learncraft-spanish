import {
  callMockSubcategoryAdapter,
  mockSubcategoryAdapter,
} from '@application/adapters/subcategoryAdapter.mock';
import {
  callMockVocabularyAdapter,
  mockVocabularyAdapter,
} from '@application/adapters/vocabularyAdapter.mock';
import { vi } from 'vitest';

// Use absolute paths for mocking with proper path aliases
const HEXAGON_PATHS = {
  callMockSubcategoryAdapter: '@application/adapters/subcategoryAdapter',
  vocabularyAdapter: '@application/adapters/vocabularyAdapter',
};

// Mock all application units with aliased paths
vi.mock(HEXAGON_PATHS.callMockSubcategoryAdapter, () =>
  callMockSubcategoryAdapter(),
);
vi.mock(HEXAGON_PATHS.vocabularyAdapter, () => ({
  useVocabularyAdapter: vi.fn().mockReturnValue(mockVocabularyAdapter),
}));

/**
 * Initialize all mocks with happy-path defaults.
 * This runs automatically when the module is imported.
 * Tests can override these defaults as needed.
 */
const initializeDefaultMocks = () => {
  // Set up adapter mocks with default happy-path data
  callMockSubcategoryAdapter();
  setupMockVocabularyAdapter();
};

/**
 * Setup hexagonal mocks for testing.
 * Call this explicitly in your test file to use hexagonal mocks.
 * This prevents conflicts with global mocks.
 */
export const setupHexagonalMocks = () => {
  // Reset mocks and apply happy-path defaults
  vi.clearAllMocks();
  initializeDefaultMocks();
};

// Initialize all mocks with happy-path defaults immediately
// to support direct imports without explicit setup
initializeDefaultMocks();

// Re-export the setup functions (alphabetically ordered to satisfy linter)
export {
  // Setup functions (alphabetically ordered)
  callMockSubcategoryAdapter,
  // Reference and utilities
  HEXAGON_PATHS,
  initializeDefaultMocks,
  // Mock instances (alphabetically ordered)
  mockSubcategoryAdapter,
  mockVocabularyAdapter,
  setupMockVocabularyAdapter,
};
