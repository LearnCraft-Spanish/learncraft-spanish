import type { UseOfficialQuizSetupMenuReturnType } from '@application/units/OfficialQuiz/useOfficialQuizSetupMenu';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockState: UseOfficialQuizSetupMenuReturnType = {
  courseCode: 'lcsp',
  setUserSelectedCourseCode: vi.fn(),
  quizNumber: 1,
  setUserSelectedQuizNumber: vi.fn(),
  quizOptions: [],
  startQuiz: vi.fn(),
};

export const {
  mock: mockUseOfficialQuizSetupMenu,
  override: overrideMockUseOfficialQuizSetupMenu,
  reset: resetMockUseOfficialQuizSetupMenu,
} = createOverrideableMock<UseOfficialQuizSetupMenuReturnType>(
  defaultMockState,
);
