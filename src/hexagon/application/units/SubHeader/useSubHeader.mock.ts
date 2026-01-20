import type useSubHeader from '@application/units/SubHeader/useSubHeader';
import type { Dispatch, SetStateAction } from 'react';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

// Define the return type based on the hook
type UseSubHeaderResult = ReturnType<typeof useSubHeader>;

// Default mock implementation matching the interface exactly
const defaultMockResult: UseSubHeaderResult = {
  authLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  isCoach: false,
  appUser: null,
  isOwnUser: false,
  activeStudentLoading: false,
  studentSelectorOpen: false,
  setStudentSelectorOpen: vi.fn<Dispatch<SetStateAction<boolean>>>(),
  clearSelection: vi.fn<() => void>(),

  // Helper booleans
  notLoggedIn: false,
  loggingIn: false,
  freeUser: false,
  studentUser: false,
  isCoachOrAdmin: false,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseSubHeader,
  override: overrideMockUseSubHeader,
  reset: resetMockUseSubHeader,
} = createOverrideableMock<UseSubHeaderResult>(defaultMockResult);

// Export default for global mocking
export default mockUseSubHeader;
