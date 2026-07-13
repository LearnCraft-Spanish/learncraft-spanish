/**
 * Hexagon Tests Setup
 *
 * This file runs before all hexagon tests to set up the testing environment.
 * It configures global mocks and provides necessary test utilities.
 */

import {
  mockAdminReportsAdapter,
  resetMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import {
  mockAssignmentsAdapter,
  resetMockAssignmentsAdapter,
} from '@application/adapters/assignmentAdapter.mock';
import {
  mockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import {
  mockCoachAdapter,
  resetMockCoachAdapter,
} from '@application/adapters/coachAdapter.mock';
import {
  mockCoachingStudentsAdapter,
  resetMockCoachingStudentsAdapter,
} from '@application/adapters/coachingStudentsAdapter.mock';
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
  mockGroupCallsAdapter,
  resetMockGroupCallsAdapter,
} from '@application/adapters/groupCallsAdapter.mock';
import {
  mockLocalStorageAdapter,
  resetMockLocalStorageAdapter,
} from '@application/adapters/localStorageAdapter.mock';
import {
  mockOfficialQuizAdapter,
  resetMockOfficialQuizAdapter,
} from '@application/adapters/officialQuizAdapter.mock';
import {
  mockPMFSurveyFrequencyAdapter,
  resetMockPMFSurveyFrequencyAdapter,
} from '@application/adapters/pmfSurveyFrequencyAdapter.mock';
import {
  mockPrivateCallsAdapter,
  resetMockPrivateCallsAdapter,
} from '@application/adapters/privateCallsAdapter.mock';
import {
  mockSkillTagsAdapter,
  resetMockSkillTagsAdapter,
} from '@application/adapters/skillTagsAdapter.mock';
import {
  mockSrLessonsAdapter,
  resetMockSrLessonsAdapter,
} from '@application/adapters/srLessonsAdapter.mock';
import {
  mockStudentsAdapter,
  resetMockStudentsAdapter,
} from '@application/adapters/studentsAdapter.mock';
import {
  mockSubcategoryAdapter,
  resetMockSubcategoryAdapter,
} from '@application/adapters/subcategoryAdapter.mock';
import {
  mockVocabularyAdapter,
  resetMockVocabularyAdapter,
} from '@application/adapters/vocabularyAdapter.mock';
import {
  mockWeeklyRecordsAdapter,
  resetMockWeeklyRecordsAdapter,
} from '@application/adapters/weeklyRecordsAdapter.mock';
import {
  mockWeeksAdapter,
  resetMockWeeksAdapter,
} from '@application/adapters/weeksAdapter.mock';
import {
  mockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockUseIncludeUnpublished,
  resetMockUseIncludeUnpublished,
} from '@application/coordinators/hooks/useIncludeUnpublished.mock';
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

vi.mock('@application/adapters/pmfSurveyFrequencyAdapter', () => ({
  usePMFSurveyFrequencyAdapter: vi.fn(() => mockPMFSurveyFrequencyAdapter),
}));

vi.mock('@application/adapters/studentsAdapter', () => ({
  useStudentsAdapter: vi.fn(() => mockStudentsAdapter),
}));

vi.mock('@application/adapters/coachingStudentsAdapter', () => ({
  useCoachingStudentsAdapter: vi.fn(() => mockCoachingStudentsAdapter),
}));

vi.mock('@application/adapters/weeksAdapter', () => ({
  useWeeksAdapter: vi.fn(() => mockWeeksAdapter),
}));

vi.mock('@application/adapters/AdminReports/adminReportsAdapter', () => ({
  useAdminReportsAdapter: vi.fn(() => mockAdminReportsAdapter),
}));

vi.mock('@application/adapters/assignmentAdapter', () => ({
  useAssignmentsAdapter: vi.fn(() => mockAssignmentsAdapter),
}));

vi.mock('@application/adapters/groupCallsAdapter', () => ({
  useGroupCallsAdapter: vi.fn(() => mockGroupCallsAdapter),
}));

vi.mock('@application/adapters/privateCallsAdapter', () => ({
  usePrivateCallsAdapter: vi.fn(() => mockPrivateCallsAdapter),
}));

vi.mock('@application/adapters/srLessonsAdapter', () => ({
  useSrLessonsAdapter: vi.fn(() => mockSrLessonsAdapter),
}));

vi.mock('@application/adapters/weeklyRecordsAdapter', () => ({
  useWeeklyRecordsAdapter: vi.fn(() => mockWeeklyRecordsAdapter),
}));

vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: vi.fn(() => mockActiveStudent),
}));

vi.mock('@application/coordinators/hooks/useSelectedCourseAndLessons', () => ({
  useSelectedCourseAndLessons: vi.fn(() => mockSelectedCourseAndLessons),
}));

vi.mock('@application/coordinators/hooks/useIncludeUnpublished', () => ({
  useIncludeUnpublished: vi.fn(() => mockUseIncludeUnpublished),
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
  resetMockPMFSurveyFrequencyAdapter();
  resetMockStudentsAdapter();
  resetMockCoachingStudentsAdapter();
  resetMockWeeksAdapter();
  resetMockAdminReportsAdapter();
  resetMockAssignmentsAdapter();
  resetMockGroupCallsAdapter();
  resetMockPrivateCallsAdapter();
  resetMockSrLessonsAdapter();
  resetMockWeeklyRecordsAdapter();
  resetMockUseStudentFlashcards();
  resetMockUseSpellingsKnownForLesson();

  // coordinator mocks
  resetMockActiveStudent();
  resetMockSelectedCourseAndLessons();
  resetMockUseIncludeUnpublished();

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
