import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useUpdateBundleCreditMutation } from '@application/queries/CoachingStudentQueries/useUpdateBundleCreditMutation';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockBundleCredit } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useUpdateBundleCreditMutation', () => {
  it('should expose the mutation function', () => {
    const { result } = renderHook(() => useUpdateBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.updateBundleCreditMutation).toBeDefined();
    expect(result.current.updateBundleCreditMutation.mutateAsync).toBeDefined();
  });

  it('should call updateBundleCredit on the adapter with the correct command', async () => {
    const mockUpdated = createMockBundleCredit();
    overrideMockCoachingStudentsAdapter({
      updateBundleCredit: async () => mockUpdated,
    });

    const { result } = renderHook(() => useUpdateBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    const returned = await act(() =>
      result.current.updateBundleCreditMutation.mutateAsync({
        bundle_credit_id: 1,
        expiration: Date.now() + 86400000,
        totalCredits: 20,
      }),
    );

    await waitFor(() =>
      expect(result.current.updateBundleCreditMutation.isSuccess).toBe(true),
    );
    expect(returned).toEqual(mockUpdated);
    expect(result.current.updateBundleCreditMutation.error).toBeNull();
  });

  it('should expose error state when updateBundleCredit fails', async () => {
    overrideMockCoachingStudentsAdapter({
      updateBundleCredit: async () => {
        throw new Error('Failed to update bundle credit');
      },
    });

    const { result } = renderHook(() => useUpdateBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.updateBundleCreditMutation.mutateAsync({
        bundle_credit_id: 1,
        expiration: Date.now(),
        totalCredits: 5,
      }),
    ).rejects.toThrow('Failed to update bundle credit');

    await waitFor(() =>
      expect(result.current.updateBundleCreditMutation.isError).toBe(true),
    );
  });
});
