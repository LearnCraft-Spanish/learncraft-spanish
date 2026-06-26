import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useDeleteBundleCreditMutation } from '@application/queries/CoachingStudentQueries/useDeleteBundleCreditMutation';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useDeleteBundleCreditMutation', () => {
  it('should expose the mutation function', () => {
    const { result } = renderHook(() => useDeleteBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.deleteBundleCreditMutation).toBeDefined();
    expect(result.current.deleteBundleCreditMutation.mutateAsync).toBeDefined();
  });

  it('should call deleteBundleCredit on the adapter and return the deleted ID', async () => {
    const deletedId = 42;
    overrideMockCoachingStudentsAdapter({
      deleteBundleCredit: async () => deletedId,
    });

    const { result } = renderHook(() => useDeleteBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    const returned = await act(() =>
      result.current.deleteBundleCreditMutation.mutateAsync({
        bundle_credit_id: deletedId,
      }),
    );

    await waitFor(() =>
      expect(result.current.deleteBundleCreditMutation.isSuccess).toBe(true),
    );
    expect(returned).toBe(deletedId);
    expect(result.current.deleteBundleCreditMutation.error).toBeNull();
  });

  it('should expose error state when deleteBundleCredit fails', async () => {
    overrideMockCoachingStudentsAdapter({
      deleteBundleCredit: async () => {
        throw new Error('Failed to delete bundle credit');
      },
    });

    const { result } = renderHook(() => useDeleteBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.deleteBundleCreditMutation.mutateAsync({
        bundle_credit_id: 1,
      }),
    ).rejects.toThrow('Failed to delete bundle credit');

    await waitFor(() =>
      expect(result.current.deleteBundleCreditMutation.isError).toBe(true),
    );
  });
});
