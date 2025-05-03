/**
 * Hexagon Tests Setup
 *
 * This file runs before all hexagon tests to set up the testing environment.
 * It configures global mocks and provides necessary test utilities.
 */

import { callMockSubcategoryAdapter } from '@application/adapters/subcategoryAdapter.mock';
import { callMockVocabularyAdapter } from '@application/adapters/vocabularyAdapter.mock';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetTestQueryClient } from './utils/testQueryClient';
import '@testing-library/jest-dom';

// Replace real adapter implementations with mocks for all tests
const setupHexagonalMocks = () => {
  vi.mock('@application/adapters/vocabularyAdapter', () => ({
    useVocabularyAdapter: callMockVocabularyAdapter,
  }));

  vi.mock('@application/adapters/subcategoryAdapter', () => ({
    useSubcategoryAdapter: callMockSubcategoryAdapter,
  }));
};

beforeEach(() => {
  setupHexagonalMocks();
});

afterEach(() => {
  vi.resetAllMocks();
  resetTestQueryClient();
});
