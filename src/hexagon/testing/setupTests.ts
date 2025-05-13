/**
 * Hexagon Tests Setup
 *
 * This file runs before all hexagon tests to set up the testing environment.
 * It configures global mocks and provides necessary test utilities.
 */

import mockSubcategoryAdapter from '@application/adapters/subcategoryAdapter.mock';
import mockVocabularyAdapter from '@application/adapters/vocabularyAdapter.mock';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetTestQueryClient } from './utils/testQueryClient';
import '@testing-library/jest-dom';

// Replace real adapter implementations with mocks for all tests
const setupAdapterMocks = () => {
  vi.mock('@application/adapters/vocabularyAdapter', () => ({
    useVocabularyAdapter: () => mockVocabularyAdapter(),
  }));

  vi.mock('@application/adapters/subcategoryAdapter', () => ({
    useSubcategoryAdapter: () => mockSubcategoryAdapter(),
  }));
};

// Setup adapter mocks for each test
beforeEach(() => {
  setupAdapterMocks();
});

// Reset all mocks after each test
afterEach(() => {
  // Clear mock call history
  vi.clearAllMocks();

  // Reset React Query client
  resetTestQueryClient();

  // Clean up any rendered components
  cleanup();
});
