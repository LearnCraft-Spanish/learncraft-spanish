import { renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import { setupMockAuth } from 'tests/setupMockAuth';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useRecentlyEditedExamples', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'admin-empty-role' });
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
      setupMockAuth({ userName: 'limited' });
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
