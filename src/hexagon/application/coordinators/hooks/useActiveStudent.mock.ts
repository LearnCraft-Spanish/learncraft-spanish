import type { UseActiveStudentReturnType } from './types';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAdapter: UseActiveStudentReturnType = {
  appUser: null,
  isLoading: false,
  error: null,
  isOwnUser: false,
  changeActiveStudent: vi.fn<() => void>(),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockActiveStudent,
  override: overrideMockActiveStudent,
  reset: resetMockActiveStudent,
} = createOverrideableMock<UseActiveStudentReturnType>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockActiveStudent;
