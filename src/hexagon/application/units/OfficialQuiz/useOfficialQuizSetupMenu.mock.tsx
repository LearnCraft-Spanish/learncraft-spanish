import type { UseOfficialQuizSetupMenuReturnType } from '@application/units/OfficialQuiz/useOfficialQuizSetupMenu';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockState: UseOfficialQuizSetupMenuReturnType = {
  selectedQuizGroup: null,
  setSelectedQuizGroup: vi.fn(),
  quizNumber: 0,
  setUserSelectedQuizNumber: vi.fn(),
  quizOptions: [],
  quizGroups: [],
  startQuiz: vi.fn(),
};

export const {
  mock: mockUseOfficialQuizSetupMenu,
  override: overrideMockUseOfficialQuizSetupMenu,
  reset: resetMockUseOfficialQuizSetupMenu,
} = createOverrideableMock<UseOfficialQuizSetupMenuReturnType>(
  defaultMockState,
);
