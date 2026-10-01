import type { AppUserPort } from '@application/ports/appUserPort';
import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useAppUserLookup } from '@application/queries/useAppUserLookup';
import { renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import {
  resetTestQueryClient,
  testQueryClient,
} from '@testing/utils/testQueryClient';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/appUserAdapter', () => ({
  useAppUserAdapter: vi.fn(),
}));

const mockGetAppUserByEmail = vi.fn<AppUserPort['getAppUserByEmail']>();

describe('useAppUserLookup', () => {
  beforeEach(() => {
    resetTestQueryClient();
    mockGetAppUserByEmail.mockReset();
    vi.mocked(useAppUserAdapter).mockReturnValue({
      getMyData: vi.fn(),
      getAppUserByEmail: mockGetAppUserByEmail,
      getAllAppStudents: vi.fn(),
    });
  });

  it('fetches a user by email and caches it under the appUser key', async () => {
    const user = createMockAppUser({ emailAddress: 'someone@fake.not' });
    mockGetAppUserByEmail.mockResolvedValue(user);
    const { result } = renderHook(() => useAppUserLookup(), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.fetchAppUserByEmail('someone@fake.not'),
    ).resolves.toEqual(user);
    expect(mockGetAppUserByEmail).toHaveBeenCalledWith('someone@fake.not');
    expect(
      testQueryClient.getQueryData(['appUser', 'someone@fake.not']),
    ).toEqual(user);
  });

  it('propagates adapter errors', async () => {
    mockGetAppUserByEmail.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAppUserLookup(), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.fetchAppUserByEmail('someone@fake.not'),
    ).rejects.toThrow('boom');
  });
});
