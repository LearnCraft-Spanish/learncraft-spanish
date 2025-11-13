import type { AuthPort } from '@application/ports/authPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import { vi } from 'vitest';

const studentAdmin = getAuthUserFromEmail('student-admin@fake.not');

if (!studentAdmin) {
  throw new Error('Student admin not found');
}

// create mock authAdapter
const defaultMockAdapter: AuthPort = {
  getAccessToken: vi
    .fn<() => Promise<string | undefined>>()
    .mockImplementation(async () => {
      // Return the email of the current authUser
      return studentAdmin.email;
    }),
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

const {
  mock: mockAuthAdapter,
  override: baseOverrideMockAuthAdapter,
  reset: resetMockAuthAdapter,
} = createOverrideableMock<AuthPort>(defaultMockAdapter);

// Custom override function that updates getAccessToken when authUser changes
export const overrideMockAuthAdapter = (overrides: Partial<AuthPort>) => {
  const result = baseOverrideMockAuthAdapter(overrides);

  // If authUser is being overridden, update getAccessToken to return the new email
  mockAuthAdapter.getAccessToken.mockImplementation(
    async () => overrides.authUser?.email ?? undefined,
  );

  return result;
};

export { mockAuthAdapter, resetMockAuthAdapter };
export default mockAuthAdapter;
