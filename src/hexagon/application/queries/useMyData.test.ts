import type { AppUserPort } from '@application/ports/appUserPort';
import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useMyData } from '@application/queries/useMyData';
import { roleHasChangedResponseSchema } from '@learncraft-spanish/shared';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  resetTestQueryClient,
  testQueryClient,
} from '@testing/utils/testQueryClient';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/appUserAdapter', () => ({
  useAppUserAdapter: vi.fn(),
}));

const mockGetMyData = vi.fn<AppUserPort['getMyData']>();

function renderUseMyData() {
  return renderHook(() => useMyData(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useMyData', () => {
  beforeEach(() => {
    resetTestQueryClient();
    mockGetMyData.mockReset();
    vi.mocked(useAppUserAdapter).mockReturnValue({
      getMyData: mockGetMyData,
      getAppUserByEmail: vi.fn(),
      getAllAppStudents: vi.fn(),
    });
  });

  it('returns isBetaTester true when the logged-in user is a beta tester', async () => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    });
    mockGetMyData.mockResolvedValue(
      createMockAppUser({
        emailAddress: 'student-lcsp@fake.not',
        betaTester: true,
      }),
    );

    const { result } = renderUseMyData();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isBetaTester).toBe(true);
    expect(result.current.myData?.betaTester).toBe(true);
  });

  it('returns isBetaTester false when the logged-in user is not a beta tester', async () => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    });
    mockGetMyData.mockResolvedValue(
      createMockAppUser({
        emailAddress: 'student-lcsp@fake.not',
        betaTester: false,
      }),
    );

    const { result } = renderUseMyData();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isBetaTester).toBe(false);
    expect(result.current.myData?.betaTester).toBe(false);
  });

  it('uses a myData query key that does not collide with useActiveStudent', async () => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    });
    mockGetMyData.mockResolvedValue(
      createMockAppUser({
        emailAddress: 'student-lcsp@fake.not',
        betaTester: true,
      }),
    );

    const { result } = renderUseMyData();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const keys = testQueryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(['myData', 'student-lcsp@fake.not']);
    expect(keys.some((key) => key[0] === 'appUser')).toBe(false);
  });

  it('returns isBetaTester false when no user is logged in', () => {
    overrideAuthAndAppUser({
      authUser: undefined,
      isAuthenticated: false,
    });

    const { result } = renderUseMyData();

    expect(result.current.myData).toBe(null);
    expect(result.current.isBetaTester).toBe(false);
    expect(mockGetMyData).not.toHaveBeenCalled();
  });

  it('returns null myData when the API reports ROLE_HAS_CHANGED', async () => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    });
    mockGetMyData.mockResolvedValue(roleHasChangedResponseSchema.value);

    const { result } = renderUseMyData();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.myData).toBe(null);
    expect(result.current.isBetaTester).toBe(false);
  });
});
