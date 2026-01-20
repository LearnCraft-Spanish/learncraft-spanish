import { overrideMockCoachAdapter } from '@application/adapters/coachAdapter.mock';
import { useAllCoachesByStudent } from '@application/queries/CoachQueries/useAllCoachesByStudent';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachCallCountList } from '@testing/factories/coachFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAllCoachesByStudent', () => {
  it('should fetch coaches by student correctly', async () => {
    // Act
    const { result } = renderHook(() => useAllCoachesByStudent(1), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to fetch coaches');
    const studentId = 1;
    overrideMockCoachAdapter({
      getAllCoachesByStudent: async () => {
        throw testError;
      },
    });

    // Act
    const { result } = renderHook(() => useAllCoachesByStudent(studentId), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch coaches');
    expect(result.current.data).toBeUndefined();
  });

  it('should return empty array when student has no coaches', async () => {
    // Arrange
    const studentId = 1;
    overrideMockCoachAdapter({
      getAllCoachesByStudent: async () => [],
    });

    // Act
    const { result } = renderHook(() => useAllCoachesByStudent(studentId), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch if studentId is 0', async () => {
    // Act
    const { result } = renderHook(() => useAllCoachesByStudent(0), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should not fetch if studentId is negative', async () => {
    // Act
    const { result } = renderHook(() => useAllCoachesByStudent(-1), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should fetch different data for different studentIds', async () => {
    // Arrange
    const student1Data = createMockCoachCallCountList(2);
    const student2Data = createMockCoachCallCountList(5);
    overrideMockCoachAdapter({
      getAllCoachesByStudent: async (studentId) => {
        if (studentId === 1) return student1Data;
        if (studentId === 2) return student2Data;
        return [];
      },
    });

    // Act - Test student 1
    const { result: result1 } = renderHook(() => useAllCoachesByStudent(1), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - Student 1
    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    expect(result1.current.data).toEqual(student1Data);
    expect(result1.current.data?.length).toBe(2);

    // Act - Test student 2
    const { result: result2 } = renderHook(() => useAllCoachesByStudent(2), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - Student 2
    await waitFor(() => expect(result2.current.isLoading).toBe(false));
    expect(result2.current.data).toEqual(student2Data);
    expect(result2.current.data?.length).toBe(5);
  });

  it('should maintain separate query keys for different studentIds', async () => {
    // Arrange
    const student1Data = createMockCoachCallCountList(2);
    const student2Data = createMockCoachCallCountList(3);
    overrideMockCoachAdapter({
      getAllCoachesByStudent: async (studentId) => {
        if (studentId === 1) return student1Data;
        if (studentId === 2) return student2Data;
        return [];
      },
    });

    // Act - Fetch for student 1
    const { result: result1 } = renderHook(() => useAllCoachesByStudent(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    expect(result1.current.data).toEqual(student1Data);

    // Act - Fetch for student 2 (different query key)
    const { result: result2 } = renderHook(() => useAllCoachesByStudent(2), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - Should fetch new data for different studentId
    await waitFor(() => expect(result2.current.isLoading).toBe(false));
    expect(result2.current.data).toEqual(student2Data);
    expect(result2.current.data).not.toEqual(result1.current.data);
  });
});
