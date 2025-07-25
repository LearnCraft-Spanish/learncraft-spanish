import { renderHook, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';

import { useVerifiedExamples } from 'src/hooks/ExampleData/useVerifiedExamples';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useUnverifiedExamples', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    });
  });
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });

    await waitFor(
      () => expect(result.current.verifiedExamplesQuery.isSuccess).toBe(true),
      {
        timeout: 3000,
        interval: 200,
      },
    );
    expect(result.current.verifiedExamplesQuery.data).toBeDefined();
  });

  it('data has length', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () =>
        expect(
          result.current.verifiedExamplesQuery.data?.length,
        ).toBeGreaterThan(0),
      {
        timeout: 3000,
        interval: 200,
      },
    );
  });

  describe('when user is not an admin or student', () => {
    beforeEach(() => {
      overrideAuthAndAppUser({
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: false,
        isLimited: true,
      });
    });
    it('isSuccess is false, data is undefined', async () => {
      const { result } = renderHook(() => useVerifiedExamples(), {
        wrapper: MockAllProviders,
      });
      await waitFor(
        () => {
          expect(result.current.verifiedExamplesQuery.isSuccess).toBe(false);
        },
        { timeout: 10000, interval: 200 },
      );
      expect(result.current.verifiedExamplesQuery.isSuccess).toBe(false);
      expect(result.current.verifiedExamplesQuery.data).toEqual(undefined);
    });
  });
});
