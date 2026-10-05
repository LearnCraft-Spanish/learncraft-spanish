import type { UseUsingAsStudentReturnType } from '@application/coordinators/hooks/useUsingAsStudent';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAdapter: UseUsingAsStudentReturnType = {
  isUsingAsStudent: false,
  setIsUsingAsStudent: vi.fn<(isUsingAsStudent: boolean) => void>(),
};

export const {
  mock: mockUseUsingAsStudent,
  override: overrideMockUseUsingAsStudent,
  reset: resetMockUseUsingAsStudent,
} = createOverrideableMock<UseUsingAsStudentReturnType>(defaultMockAdapter);

export default mockUseUsingAsStudent;
