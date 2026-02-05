import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useExamplesToEditQuery } from '@application/queries/ExampleQueries/useExamplesToEditQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleTechnicalList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useExamplesToEditQuery', () => {
  beforeEach(() => {
    overrideMockExampleAdapter({
      getExamplesForEditingByIds: async () => createMockExampleTechnicalList(2),
    });
  });

  it('should fetch examples for editing by ids correctly', async () => {
    // Arrange
    const mockData = createMockExampleTechnicalList(2);
    overrideMockExampleAdapter({
      getExamplesForEditingByIds: async () => mockData,
    });

    // Act
    const { result } = renderHook(() => useExamplesToEditQuery([1, 2]), {
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
    const testError = new Error('Failed to fetch examples for editing');
    overrideMockExampleAdapter({
      getExamplesForEditingByIds: async () => {
        throw testError;
      },
    });

    // Act
    const { result } = renderHook(() => useExamplesToEditQuery([1, 2]), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Failed to fetch examples for editing',
    );
    expect(result.current.examples).toBeUndefined();
  });

  it('should return undefined examples when ids array is empty', async () => {
    // Arrange
    overrideMockExampleAdapter({
      getExamplesForEditingByIds: async () => createMockExampleTechnicalList(0),
    });

    // Act
    const { result } = renderHook(() => useExamplesToEditQuery([]), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
