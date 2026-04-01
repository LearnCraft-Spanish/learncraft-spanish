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
  it('should call updateCourses on the adapter and show success toast', async () => {
    const mockData = createRealisticCourseDetailedList();
    overrideMockCourseAdapter({
      updateCourses: () => Promise.resolve(mockData),
    });

    const { toast } = await import('react-toastify');

    const { result } = renderHook(() => useCoursesMutations(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.updateCourses).toBeDefined();

    await result.current.updateCourses(mockData);

    expect(toast.success).toHaveBeenCalledWith(
      'Programs updated successfully!',
    );
    expect(result.current.error).toBeNull();
  });

  it('should show error toast when update fails', async () => {
    const testError = new Error('Server error');
    overrideMockCourseAdapter({
      updateCourses: () => Promise.reject(testError),
    });

    const { toast } = await import('react-toastify');

    const { result } = renderHook(() => useCoursesMutations(), {
      wrapper: TestQueryClientProvider,
    });

    await expect(result.current.updateCourses([])).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to update programs: Server error',
    );
  });
});
