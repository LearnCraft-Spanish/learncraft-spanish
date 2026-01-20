import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useExamplesByRecentlyModified } from '@application/queries/ExampleQueries/useExamplesByRecentlyModified';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleTechnicalList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useExamplesByRecentlyModified', () => {
  beforeEach(() => {
    overrideMockExampleAdapter({
      getExamplesByRecentlyModified: async () =>
        createMockExampleTechnicalList(2),
    });
  });

  it('should fetch examples by recently modified correctly', async () => {
    // Arrange
    const mockData = createMockExampleTechnicalList(2);
    overrideMockExampleAdapter({
      getExamplesByRecentlyModified: async () => mockData,
    });

    // Act
    const { result } = renderHook(() => useExamplesByRecentlyModified(0, 10), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to fetch examples');
    overrideMockExampleAdapter({
      getExamplesByRecentlyModified: async () => {
        throw testError;
      },
    });

    // Act
    const { result } = renderHook(() => useExamplesByRecentlyModified(0, 10), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch examples');
    expect(result.current.examples).toBeUndefined();
  });

  it('should return empty array when no examples are found', async () => {
    // Arrange
    overrideMockExampleAdapter({
      getExamplesByRecentlyModified: async () =>
        createMockExampleTechnicalList(0),
    });

    // Act
    const { result } = renderHook(() => useExamplesByRecentlyModified(0, 10), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle different page numbers correctly', async () => {
    // Arrange
    const mockData = createMockExampleTechnicalList(5);
    overrideMockExampleAdapter({
      getExamplesByRecentlyModified: async (page: number) => {
        // Simulate pagination by returning different data per page
        return mockData.slice(page * 2, page * 2 + 2);
      },
    });

    // Act
    const { result } = renderHook(() => useExamplesByRecentlyModified(1, 2), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(mockData.slice(2, 4));
    expect(result.current.error).toBeNull();
  });
});
