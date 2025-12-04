import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useExampleMutations } from '@application/queries/ExampleQueries/useExampleMutations';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useExampleMutations', () => {
  beforeEach(() => {
    overrideMockExampleAdapter({
      createExamples: async () => createMockExampleWithVocabularyList(1),
      updateExamples: async () => createMockExampleWithVocabularyList(1),
      deleteExamples: async () => [1, 2, 3],
    });
  });

  describe('createExamples', () => {
    it('should create examples successfully', async () => {
      // Arrange
      const { toast } = await import('react-toastify');
      const mockData = createMockExampleWithVocabularyList(1);
      overrideMockExampleAdapter({
        createExamples: async () => mockData,
      });

      // Act
      const { result } = renderHook(() => useExampleMutations(), {
        wrapper: TestQueryClientProvider,
      });

      // Assert
      expect(result.current.createExamples).toBeDefined();

      // Execute mutation
      result.current.createExamples.mutate([] as any);

      // Wait for success
      await waitFor(() =>
        expect(result.current.createExamples.isSuccess).toBe(true),
      );

      expect(toast.success).toHaveBeenCalledWith(
        'All examples created successfully',
      );
    });

    it('should handle create examples errors correctly', async () => {
      // Arrange
      const { toast } = await import('react-toastify');
      const testError = new Error('Failed to create examples');
      overrideMockExampleAdapter({
        createExamples: async () => {
          throw testError;
        },
      });

      // Act
      const { result } = renderHook(() => useExampleMutations(), {
        wrapper: TestQueryClientProvider,
      });

      // Execute mutation
      result.current.createExamples.mutate([] as any);

      // Wait for error
      await waitFor(() =>
        expect(result.current.createExamples.isError).toBe(true),
      );

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create some examples',
      );
      expect(result.current.createExamples.error).toBeInstanceOf(Error);
    });
  });

  describe('updateExamples', () => {
    it('should update examples successfully', async () => {
      // Arrange
      const { toast } = await import('react-toastify');
      const mockData = createMockExampleWithVocabularyList(1);
      overrideMockExampleAdapter({
        updateExamples: async () => mockData,
      });

      // Act
      const { result } = renderHook(() => useExampleMutations(), {
        wrapper: TestQueryClientProvider,
      });

      // Assert
      expect(result.current.updateExamples).toBeDefined();

      // Execute mutation
      result.current.updateExamples.mutate([] as any);

      // Wait for success
      await waitFor(() =>
        expect(result.current.updateExamples.isSuccess).toBe(true),
      );

      expect(toast.success).toHaveBeenCalledWith(
        'All examples updated successfully',
      );
    });

    it('should handle update examples errors correctly', async () => {
      // Arrange
      const { toast } = await import('react-toastify');
      const testError = new Error('Failed to update examples');
      overrideMockExampleAdapter({
        updateExamples: async () => {
          throw testError;
        },
      });

      // Act
      const { result } = renderHook(() => useExampleMutations(), {
        wrapper: TestQueryClientProvider,
      });

      // Execute mutation
      result.current.updateExamples.mutate([] as any);

      // Wait for error
      await waitFor(() =>
        expect(result.current.updateExamples.isError).toBe(true),
      );

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update some examples',
      );
      expect(result.current.updateExamples.error).toBeInstanceOf(Error);
    });
  });

  describe('deleteExamples', () => {
    it('should delete examples successfully', async () => {
      // Arrange
      const { toast } = await import('react-toastify');
      const deletedIds = [1, 2, 3];
      overrideMockExampleAdapter({
        deleteExamples: async () => deletedIds,
      });

      // Act
      const { result } = renderHook(() => useExampleMutations(), {
        wrapper: TestQueryClientProvider,
      });

      // Assert
      expect(result.current.deleteExamples).toBeDefined();

      // Execute mutation
      result.current.deleteExamples.mutate([1, 2, 3]);

      // Wait for success
      await waitFor(() =>
        expect(result.current.deleteExamples.isSuccess).toBe(true),
      );

      expect(toast.success).toHaveBeenCalledWith(
        'All examples deleted successfully',
      );
    });

    it('should handle delete examples errors correctly', async () => {
      // Arrange
      const { toast } = await import('react-toastify');
      const testError = new Error('Failed to delete examples');
      overrideMockExampleAdapter({
        deleteExamples: async () => {
          throw testError;
        },
      });

      // Act
      const { result } = renderHook(() => useExampleMutations(), {
        wrapper: TestQueryClientProvider,
      });

      // Execute mutation
      result.current.deleteExamples.mutate([1, 2, 3]);

      // Wait for error
      await waitFor(() =>
        expect(result.current.deleteExamples.isError).toBe(true),
      );

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete some examples',
      );
      expect(result.current.deleteExamples.error).toBeInstanceOf(Error);
    });
  });
});
