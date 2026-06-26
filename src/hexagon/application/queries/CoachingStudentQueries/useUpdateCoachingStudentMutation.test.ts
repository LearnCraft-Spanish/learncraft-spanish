import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useUpdateCoachingStudentMutation } from '@application/queries/CoachingStudentQueries/useUpdateCoachingStudentMutation';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockCoachingStudent } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useUpdateCoachingStudentMutation', () => {
  it('should expose the mutation function', () => {
    const { result } = renderHook(() => useUpdateCoachingStudentMutation(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.updateCoachingStudentMutation).toBeDefined();
    expect(
      result.current.updateCoachingStudentMutation.mutateAsync,
    ).toBeDefined();
  });

  it('should call updateCoachingStudent on the adapter with the correct command', async () => {
    const mockUpdated = createMockCoachingStudent();
    overrideMockCoachingStudentsAdapter({
      updateCoachingStudent: async () => mockUpdated,
    });

    const { result } = renderHook(() => useUpdateCoachingStudentMutation(), {
      wrapper: TestQueryClientProvider,
    });

    const returned = await act(() =>
      result.current.updateCoachingStudentMutation.mutateAsync({
        student_id: mockUpdated.student_id,
        firstName: mockUpdated.firstName,
        lastName: mockUpdated.lastName,
        email: mockUpdated.email,
      }),
    );

    await waitFor(() =>
      expect(result.current.updateCoachingStudentMutation.isSuccess).toBe(true),
    );
    expect(returned).toEqual(mockUpdated);
    expect(result.current.updateCoachingStudentMutation.error).toBeNull();
  });

  it('should expose error state when updateCoachingStudent fails', async () => {
    overrideMockCoachingStudentsAdapter({
      updateCoachingStudent: async () => {
        throw new Error('Failed to update coaching student');
      },
    });

    const { result } = renderHook(() => useUpdateCoachingStudentMutation(), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.updateCoachingStudentMutation.mutateAsync({
        student_id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      }),
    ).rejects.toThrow('Failed to update coaching student');

    await waitFor(() =>
      expect(result.current.updateCoachingStudentMutation.isError).toBe(true),
    );
  });
});
