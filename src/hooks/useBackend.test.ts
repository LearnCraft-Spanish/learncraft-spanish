import { renderHook, waitFor } from '@testing-library/react';

import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useBackend } from './useBackend';

describe('useBackend Hook', () => {
  let hookResult: ReturnType<typeof useBackend>;

  // Initialize the hook before all tests
  beforeAll(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isAdmin: true,
        isCoach: true,
        isStudent: true,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
    const { result } = renderHook(() => useBackend(), {
      wrapper: MockAllProviders,
    });
    hookResult = result.current; // Store the current hook result once
  });

  it('renders without crashing', async () => {
    await waitFor(() => expect(hookResult).toBeDefined());
    expect(hookResult).toBeDefined();
  });

  describe('getAccessToken function', () => {
    beforeEach(() => {
      overrideAuthAndAppUser({
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isAdmin: true,
        isCoach: true,
        isStudent: true,
        isLimited: false,
      });
      const { result } = renderHook(() => useBackend(), {
        wrapper: MockAllProviders,
      });
      hookResult = result.current; // Store the current hook result once
    });

    it('returns a string when logged in', async () => {
      const token = await hookResult.getAccessToken(['']);
      expect(token).toBeDefined();
    });
    it('does not return a string when not logged in', async () => {
      overrideAuthAndAppUser(
        {
          authUser: undefined,
          isAuthenticated: false,
          isLoading: false,
        },
        {
          appUser: undefined,
          isLoading: false,
          error: null,
          isOwnUser: false,
        },
      );
      const unauthHookResult = renderHook(() => useBackend(), {
        wrapper: MockAllProviders,
      }).result.current;
      const token = await unauthHookResult.getAccessToken(['']);
      expect(token).toBeUndefined();
    });
  });
});
