import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { HttpResponse, http } from 'msw';
import MockAllProviders from '../../mocks/Providers/MockAllProviders';
import { server } from '../../mocks/api/server';
import { setupMockAuth } from '../../tests/setupMockAuth';

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
      { timeout: 3000, interval: 200 },
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
      { timeout: 3000, interval: 200 },
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
      setupMockAuth({ userName: 'limited' });
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
