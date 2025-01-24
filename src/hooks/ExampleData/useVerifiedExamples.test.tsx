import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useVerifiedExamples } from 'src/hooks/ExampleData/useVerifiedExamples';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { setupMockAuth } from 'tests/setupMockAuth';

describe.skip('useVerifiedExamples', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    const query = result.current.verifiedExamplesQuery;
    await waitFor(() => expect(query.isSuccess).toBe(true), {
      timeout: 3000,
      interval: 200,
    });
    expect(query.data).toBeDefined();
  });

  it('data has length', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    const query = result.current.verifiedExamplesQuery;
    await waitFor(() => expect(query.data?.length).toBeGreaterThan(0), {
      timeout: 3000,
      interval: 200,
    });
  });
  describe('when user is not an admin or student', () => {
    beforeEach(() => {
      setupMockAuth({ userName: 'limited' });
    });
    it('isSuccess is false, data is undefined', async () => {
      const { result } = renderHook(() => useVerifiedExamples(), {
        wrapper: MockAllProviders,
      });
      const query = result.current.verifiedExamplesQuery;
      await waitFor(
        () => {
          expect(query.isSuccess).toBe(false);
        },
        { timeout: 10000, interval: 200 },
      );
      expect(query.isSuccess).toBe(false);
      expect(query.data).toEqual(undefined);
    });
  });
});
