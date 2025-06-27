/**
 * Hexagon Tests Setup
 *
 * This file runs before all hexagon tests to set up the testing environment.
 * It configures global mocks and provides necessary test utilities.
 */

import {
  mockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import {
  mockSubcategoryAdapter,
  resetMockSubcategoryAdapter,
} from '@application/adapters/subcategoryAdapter.mock';
import {
  mockVocabularyAdapter,
  resetMockVocabularyAdapter,
} from '@application/adapters/vocabularyAdapter.mock';
import {
  mockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';

import {
  mockSelectedCourseAndLessons,
  resetMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetTestQueryClient } from './utils/testQueryClient';
import '@testing-library/jest-dom';

// Replace real adapter implementations with mocks for all tests
vi.mock('@application/adapters/vocabularyAdapter', () => ({
  useVocabularyAdapter: vi.fn(() => mockVocabularyAdapter),
}));

vi.mock('@application/adapters/subcategoryAdapter', () => ({
  useSubcategoryAdapter: vi.fn(() => mockSubcategoryAdapter),
}));

vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: vi.fn(() => mockActiveStudent),
}));

vi.mock('@application/coordinators/hooks/useSelectedCourseAndLessons', () => ({
  useSelectedCourseAndLessons: vi.fn(() => mockSelectedCourseAndLessons),
}));

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: vi.fn(() => mockAuthAdapter),
}));

const resetAdapterMocks = () => {
  // Reset the adapter mocks to their default implementations
  resetMockVocabularyAdapter();
  resetMockSubcategoryAdapter();
  resetMockActiveStudent();
  resetMockSelectedCourseAndLessons();
  resetMockAuthAdapter();
};

// Reset all mocks after each test
afterEach(() => {
  // Clear mock call history
  resetAdapterMocks();
  vi.clearAllMocks();

  // Reset React Query client
  resetTestQueryClient();

  // Clean up any rendered components
  cleanup();
});
