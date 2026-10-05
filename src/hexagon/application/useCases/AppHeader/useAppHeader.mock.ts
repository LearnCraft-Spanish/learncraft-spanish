import type { UseAppHeaderResult } from '@application/useCases/AppHeader/useAppHeader';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockResult: UseAppHeaderResult = {
  isAuthenticated: false,
  isLoading: false,
  isSignedIn: false,
  studentName: undefined,
  studentEmail: undefined,
  isStaff: false,
  staffRole: null,
  showUseAsStudent: false,
  isStaffUsingAsStudent: false,
  usingAs: null,
  stopUsingAsStudent: vi.fn<() => void>(),
  login: vi.fn<() => void>(),
  logout: vi.fn<() => void>(),
};

export const {
  mock: mockUseAppHeader,
  override: overrideMockUseAppHeader,
  reset: resetMockUseAppHeader,
} = createOverrideableMock<UseAppHeaderResult>(defaultMockResult);

export default mockUseAppHeader;
