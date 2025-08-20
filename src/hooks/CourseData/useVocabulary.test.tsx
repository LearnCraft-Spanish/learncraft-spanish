import { renderHook, waitFor } from '@testing-library/react';
import { server } from 'mocks/api/server';

import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { http, HttpResponse } from 'msw';

import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { describe, expect, it } from 'vitest';
import { useVocabulary } from './useVocabulary';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

describe('useVocabulary', () => {
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () => {
        expect(result.current.vocabularyQuery.isSuccess).toBe(true);
      },
      { timeout: 10000, interval: 200 },
    );
    expect(result.current.vocabularyQuery.data).toBeDefined();
  });

  it('vocabularyQuery data has length', async () => {
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () => {
        expect(result.current.vocabularyQuery.isSuccess).toBe(true);
      },
      { timeout: 10000, interval: 200 },
    );
    expect(result.current.vocabularyQuery.data?.length).toBeGreaterThan(0);
  });
  describe('failing', () => {
    it('vocabularyQuery data is undefined', async () => {
      server.use(
        http.get(`${backendUrl}public/vocabulary`, () => {
          return HttpResponse.json(undefined);
        }),
      );
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() => {
        expect(result.current.vocabularyQuery.isError).toBeTruthy();
      });
      expect(result.current.vocabularyQuery.data).not.toBeDefined();
    });

    it('vocabularyQuery data is undefined when user is not an admin or student', async () => {
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: false,
        isLimited: true,
      });
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: MockAllProviders,
      });
      // This is a bit of a hack to make sure the query has time to run
      await waitFor(() => {
        expect(result.current.vocabularyQuery.isSuccess).toBeFalsy();
      });
      await waitFor(() => {
        expect(result.current.vocabularyQuery.isSuccess).toBeFalsy();
      });
      expect(result.current.vocabularyQuery.data).not.toBeDefined();
    });
  });
});
