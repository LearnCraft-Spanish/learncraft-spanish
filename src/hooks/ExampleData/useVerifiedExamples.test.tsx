import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useVerifiedExamples } from 'src/hooks/ExampleData/useVerifiedExamples';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { setupMockAuth } from 'tests/setupMockAuth';

describe('useVerifiedExamples', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 3000,
      interval: 200,
    });
    expect(result.current.data).toBeDefined();
  });

  it('data has length', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () => expect(result.current.data?.length).toBeGreaterThan(0),
      { timeout: 3000, interval: 200 },
    );
  });
  describe('when user is not an admin or student', () => {
    beforeEach(() => {
      setupMockAuth({ userName: 'limited' });
    });
    it('isSuccess is false, data is undefined', async () => {
      const { result } = renderHook(() => useVerifiedExamples(), {
        wrapper: MockAllProviders,
      });
      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(false);
        },
        { timeout: 10000, interval: 200 },
      );
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toEqual(undefined);
    });
  });
});
