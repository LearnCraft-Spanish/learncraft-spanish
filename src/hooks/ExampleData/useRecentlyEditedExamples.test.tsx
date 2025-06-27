import { renderHook, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';

import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useRecentlyEditedExamples', () => {
  beforeEach(() => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    });
  });
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useRecentlyEditedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () =>
        expect(result.current.recentlyEditedExamplesQuery.isSuccess).toBe(true),
      {
        timeout: 3000,
        interval: 200,
      },
    );
    expect(result.current.recentlyEditedExamplesQuery.data).toBeDefined();
  });

  it('data has length', async () => {
    const { result } = renderHook(() => useRecentlyEditedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () =>
        expect(
          result.current.recentlyEditedExamplesQuery.data?.length,
        ).toBeGreaterThan(0),
      {
        timeout: 3000,
        interval: 200,
      },
    );
  });
  describe('when user is not an admin or student', () => {
    beforeEach(() => {
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: false,
        isLimited: true,
      });
    });
    it('isSuccess is false, data is undefined', async () => {
      const { result } = renderHook(() => useRecentlyEditedExamples(), {
        wrapper: MockAllProviders,
      });
      await waitFor(
        () => {
          expect(result.current.recentlyEditedExamplesQuery.isSuccess).toBe(
            false,
          );
        },
        { timeout: 10000, interval: 200 },
      );
      expect(result.current.recentlyEditedExamplesQuery.isSuccess).toBe(false);
      expect(result.current.recentlyEditedExamplesQuery.data).toEqual(
        undefined,
      );
    });
  });
});
