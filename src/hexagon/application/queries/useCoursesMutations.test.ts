import { overrideMockCourseAdapter } from '@application/adapters/courseAdapter.mock';
import { useCoursesMutations } from '@application/queries/useCoursesMutations';
import { renderHook } from '@testing-library/react';
import { createRealisticCourseDetailedList } from '@testing/factories/courseFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCoursesMutations', () => {
  it('should call updateCourses on the adapter', async () => {
    const mockData = createRealisticCourseDetailedList();
    overrideMockCourseAdapter({
      updateCourses: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useCoursesMutations(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.updateCourses).toBeDefined();

    await result.current.updateCourses(mockData);

    expect(result.current.error).toBeNull();
  });

  it('should console error when update fails', async () => {
    const testError = new Error('Server error');
    // spy console.error
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    overrideMockCourseAdapter({
      updateCourses: () => Promise.reject(testError),
    });

    const { result } = renderHook(() => useCoursesMutations(), {
      wrapper: TestQueryClientProvider,
    });

    await expect(result.current.updateCourses([])).rejects.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to update courses: Server error',
    );
    consoleErrorSpy.mockRestore();
  });
});
