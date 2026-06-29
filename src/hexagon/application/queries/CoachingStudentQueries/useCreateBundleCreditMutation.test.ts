import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useCreateBundleCreditMutation } from '@application/queries/CoachingStudentQueries/useCreateBundleCreditMutation';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockBundleCredit } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useCreateBundleCreditMutation', () => {
  it('should expose the mutation function', () => {
    const { result } = renderHook(() => useCreateBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.createBundleCreditMutation).toBeDefined();
    expect(result.current.createBundleCreditMutation.mutateAsync).toBeDefined();
  });

  it('should call createBundleCredit on the adapter with the correct command', async () => {
    const mockCreated = createMockBundleCredit();
    const cmd = {
      student_id: 1,
      expiration: Date.now() + 86400000,
      totalCredits: 10,
      usedCredits: 0,
    };
    overrideMockCoachingStudentsAdapter({
      createBundleCredit: async () => mockCreated,
    });

    const { result } = renderHook(() => useCreateBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    await act(() => result.current.createBundleCreditMutation.mutateAsync(cmd));

    await waitFor(() =>
      expect(result.current.createBundleCreditMutation.isSuccess).toBe(true),
    );
    expect(result.current.createBundleCreditMutation.error).toBeNull();
  });

  it('should expose error state when createBundleCredit fails', async () => {
    overrideMockCoachingStudentsAdapter({
      createBundleCredit: async () => {
        throw new Error('Failed to create bundle credit');
      },
    });

    const { result } = renderHook(() => useCreateBundleCreditMutation(1), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.createBundleCreditMutation.mutateAsync({
        student_id: 1,
        expiration: Date.now(),
        totalCredits: 5,
        usedCredits: 0,
      }),
    ).rejects.toThrow('Failed to create bundle credit');

    await waitFor(() =>
      expect(result.current.createBundleCreditMutation.isError).toBe(true),
    );
  });
});
