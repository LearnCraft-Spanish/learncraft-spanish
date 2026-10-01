import type { UseAppUserLookupReturn } from '@application/queries/useAppUserLookup';
import type { AppUser } from '@learncraft-spanish/shared';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockResult: UseAppUserLookupReturn = {
  fetchAppUserByEmail: vi.fn<(email: string) => Promise<AppUser | null>>(
    async (email) =>
      createMockAppUser({ emailAddress: email, studentRole: 'student' }),
  ),
};

export const {
  mock: mockUseAppUserLookup,
  override: overrideMockUseAppUserLookup,
  reset: resetMockUseAppUserLookup,
} = createOverrideableMock<UseAppUserLookupReturn>(defaultMockResult);

export default mockUseAppUserLookup;
