import { overrideMockSubcategoryAdapter } from '@application/adapters/subcategoryAdapter.mock';
import { useSubcategories } from '@application/queries/useSubcategories/useSubcategories';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useSubcategories', () => {
  it('should fetch subcategories correctly', async () => {
    // Arrange
    const mockData = createMockSubcategoryList(3);
    overrideMockSubcategoryAdapter({
      getSubcategories: () => Promise.resolve(mockData),
    });

    // Act
    const { result } = renderHook(() => useSubcategories(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.loading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subcategories).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to fetch subcategories');
    overrideMockSubcategoryAdapter({
      getSubcategories: () => Promise.reject(testError),
    });

    // Act
    const { result } = renderHook(() => useSubcategories(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch subcategories');
    expect(result.current.subcategories).toEqual([]);
  });

  it('should refetch data when refetch is called', async () => {
    // Arrange
    const mockData = createMockSubcategoryList(3);
    overrideMockSubcategoryAdapter({
      getSubcategories: () => Promise.resolve(mockData),
    });

    // Act
    const { result, rerender } = renderHook(() => useSubcategories(), {
      wrapper: TestQueryClientProvider,
    });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Change mock data for refetch
    const newMockData = createMockSubcategoryList(2);
    overrideMockSubcategoryAdapter({
      getSubcategories: () => Promise.resolve(newMockData),
    });

    // Re-render the hook to pick up the new mock
    rerender();

    // Trigger refetch
    await result.current.refetch();

    // Assert
    await waitFor(() =>
      expect(result.current.subcategories).toEqual(newMockData),
    );
  });
});
