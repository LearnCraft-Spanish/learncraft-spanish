import { overrideMockCourseAdapter } from '@application/adapters/courseAdapter.mock';
import { useCoursesMutations } from '@application/queries/useCoursesMutations';
import { renderHook } from '@testing-library/react';
import { createRealisticCourseDetailedList } from '@testing/factories/courseFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

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
});
