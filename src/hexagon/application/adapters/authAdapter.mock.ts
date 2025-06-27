import type { AuthPort } from '../ports/authPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import { vi } from 'vitest';

const studentAdmin = getAuthUserFromEmail('student-admin@fake.not');

if (!studentAdmin) {
  throw new Error('Student admin not found');
}

// create mock authAdapter
const defaultMockAdapter: AuthPort = {
  getAccessToken: vi.fn<() => Promise<string | undefined>>(),
  login: vi.fn<() => void>(),
  logout: vi.fn<() => void>(),
  authUser: studentAdmin,
  isAdmin: true,
  isCoach: true,
  isStudent: true,
  isLimited: false,
  isAuthenticated: true,
  isLoading: false,
};

export const {
  mock: mockAuthAdapter,
  override: overrideMockAuthAdapter,
  reset: resetMockAuthAdapter,
} = createOverrideableMock<AuthPort>(defaultMockAdapter);

export default mockAuthAdapter;
