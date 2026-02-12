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
  mockCoachAdapter,
  resetMockCoachAdapter,
} from '@application/adapters/coachAdapter.mock';
import {
  mockCourseAdapter,
  resetMockCourseAdapter,
} from '@application/adapters/courseAdapter.mock';
import {
  mockExampleAdapter,
  resetMockExampleAdapter,
} from '@application/adapters/exampleAdapter.mock';
import {
  mockFlashcardAdapter,
  resetMockFlashcardAdapter,
} from '@application/adapters/flashcardAdapter.mock';
import {
  mockLocalStorageAdapter,
  resetMockLocalStorageAdapter,
} from '@application/adapters/localStorageAdapter.mock';
import {
  mockOfficialQuizAdapter,
  resetMockOfficialQuizAdapter,
} from '@application/adapters/officialQuizAdapter.mock';
import {
  mockSkillTagsAdapter,
  resetMockSkillTagsAdapter,
} from '@application/adapters/skillTagsAdapter.mock';
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

import {
  mockUseSpellingsKnownForLesson,
  resetMockUseSpellingsKnownForLesson,
} from '@application/queries/useSpellingsKnownForLesson/useSpellingsKnownForLesson.mock';
import {
  mockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { cleanup } from '@testing-library/react';
import { resetTestQueryClient } from '@testing/utils/testQueryClient';

import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Replace real adapter implementations with mocks for all tests
vi.mock('@application/adapters/courseAdapter', () => ({
  useCourseAdapter: vi.fn(() => mockCourseAdapter),
}));

vi.mock('@application/adapters/coachAdapter', () => ({
  useCoachAdapter: vi.fn(() => mockCoachAdapter),
}));

vi.mock('@application/adapters/vocabularyAdapter', () => ({
  useVocabularyAdapter: vi.fn(() => mockVocabularyAdapter),
}));

vi.mock('@application/adapters/subcategoryAdapter', () => ({
  useSubcategoryAdapter: vi.fn(() => mockSubcategoryAdapter),
}));

vi.mock('@application/adapters/exampleAdapter', () => ({
  useExampleAdapter: vi.fn(() => mockExampleAdapter),
}));

vi.mock('@application/adapters/flashcardAdapter', () => ({
  useFlashcardAdapter: vi.fn(() => mockFlashcardAdapter),
}));

vi.mock('@application/adapters/officialQuizAdapter', () => ({
  useOfficialQuizAdapter: vi.fn(() => mockOfficialQuizAdapter),
}));

vi.mock('@application/adapters/skillTagsAdapter', () => ({
  useSkillTagsAdapter: vi.fn(() => mockSkillTagsAdapter),
}));

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: vi.fn(() => mockAuthAdapter),
}));

vi.mock('@application/adapters/localStorageAdapter', () => ({
  LocalStorageAdapter: () => mockLocalStorageAdapter,
}));

vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: vi.fn(() => mockActiveStudent),
}));

vi.mock('@application/coordinators/hooks/useSelectedCourseAndLessons', () => ({
  useSelectedCourseAndLessons: vi.fn(() => mockSelectedCourseAndLessons),
}));

vi.mock('@application/units/useStudentFlashcards', () => ({
  useStudentFlashcards: vi.fn(() => mockUseStudentFlashcards),
}));

vi.mock('@application/queries/useSpellingsKnownForLesson', () => ({
  useSpellingsKnownForLesson: vi.fn(() => mockUseSpellingsKnownForLesson),
}));

const resetGlobalMocks = () => {
  //resetAuthAdapter
  resetMockAuthAdapter();

  // adapter mocks
  resetMockCoachAdapter();
  resetMockVocabularyAdapter();
  resetMockSubcategoryAdapter();
  resetMockExampleAdapter();
  resetMockActiveStudent();
  resetMockCourseAdapter();
  resetMockFlashcardAdapter();
  resetMockLocalStorageAdapter();
  resetMockOfficialQuizAdapter();
  resetMockSkillTagsAdapter();
  resetMockUseStudentFlashcards();
  resetMockUseSpellingsKnownForLesson();

  // coordinator mocks
  resetMockActiveStudent();
  resetMockSelectedCourseAndLessons();

  // unit mocks
  resetMockUseStudentFlashcards();
};

afterEach(() => {
  // Clear mock call history
  vi.clearAllMocks();
  // Reset the adapter mocks to their default implementations
  resetGlobalMocks();

  // Reset React Query client
  resetTestQueryClient();

  // Clean up any rendered components
  cleanup();
});
