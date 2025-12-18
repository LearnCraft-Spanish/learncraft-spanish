import type { ExampleTechnical } from '@learncraft-spanish/shared';
import {
  overrideMockExampleAdapter,
  resetMockExampleAdapter,
} from '@application/adapters/exampleAdapter.mock';
import { useExamplesToEditQuery } from '@application/queries/ExampleQueries/useExamplesToEditQuery';
import { useExampleEditor } from '@application/useCases/useExampleEditor/useExampleEditor';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockExampleTechnicalList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useExamplesToEditQuery
vi.mock('@application/queries/ExampleQueries/useExamplesToEditQuery', () => ({
  useExamplesToEditQuery: vi.fn(() => ({
    examples: createMockExampleTechnicalList(3),
    isLoading: false,
    error: null,
  })),
}));

describe('useExampleEditor', () => {
  beforeEach(() => {
    resetMockExampleAdapter();
    vi.mocked(useExamplesToEditQuery).mockReturnValue({
      examples: createMockExampleTechnicalList(3),
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper to create examples with specific audio states
   */
  const createExamplesWithAudio = (
    configs: { hasAudio: boolean; id: number }[],
  ): ExampleTechnical[] => {
    return configs.map(
      ({ hasAudio, id }) =>
        createMockExampleTechnicalList(1, {
          id,
          spanish: `Spanish ${id}`,
          english: `English ${id}`,
          spanishAudio: hasAudio ? `https://example.com/ex${id}la.mp3` : '',
          englishAudio: hasAudio ? `https://example.com/ex${id}en.mp3` : '',
          spanglish: false,
          vocabularyComplete: true,
        })[0],
    );
  };

  describe('initialization', () => {
    it('should initialize with source examples', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      // Should have 3 rows (default mock returns 3)
      expect(result.current.editTable.data.rows).toHaveLength(3);
    });

    it('should not have unsaved changes initially', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.editTable.hasUnsavedChanges).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.saveError).toBeNull();
    });

    it('should expose table columns', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const columnIds = result.current.editTable.data.columns.map((c) => c.id);
      expect(columnIds).toContain('id');
      expect(columnIds).toContain('spanish');
      expect(columnIds).toContain('english');
      expect(columnIds).toContain('hasAudio');
      expect(columnIds).toContain('spanglish');
      expect(columnIds).toContain('vocabularyComplete');
    });
  });

  describe('audio URL to boolean mapping', () => {
    it('should map examples WITH audio to hasAudio=true', () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 1 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.editTable.data.rows[0];
      expect(row.cells.hasAudio).toBe('true');
    });

    it('should map examples WITHOUT audio to hasAudio=false', () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createExamplesWithAudio([{ hasAudio: false, id: 1 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.editTable.data.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should map examples with only spanishAudio to hasAudio=false', () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createMockExampleTechnicalList(1, {
          spanishAudio: 'https://example.com/audio.mp3',
          englishAudio: '',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.editTable.data.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should map examples with only englishAudio to hasAudio=false', () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createMockExampleTechnicalList(1, {
          spanishAudio: '',
          englishAudio: 'https://example.com/audio.mp3',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.editTable.data.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should correctly map mixed audio states', () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createExamplesWithAudio([
          { hasAudio: true, id: 1 },
          { hasAudio: false, id: 2 },
          { hasAudio: true, id: 3 },
        ]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rows = result.current.editTable.data.rows;
      expect(rows[0].cells.hasAudio).toBe('true');
      expect(rows[1].cells.hasAudio).toBe('false');
      expect(rows[2].cells.hasAudio).toBe('true');
    });
  });

  describe('field mapping', () => {
    it('should map all ExampleTechnical fields correctly', () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createMockExampleTechnicalList(1, {
          id: 42,
          spanish: 'Hola mundo',
          english: 'Hello world',
          spanglish: true,
          vocabularyComplete: false,
          spanishAudio: 'https://example.com/ex42la.mp3',
          englishAudio: 'https://example.com/ex42en.mp3',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.editTable.data.rows[0];
      expect(row.cells.id).toBe('42');
      expect(row.cells.spanish).toBe('Hola mundo');
      expect(row.cells.english).toBe('Hello world');
      expect(row.cells.spanglish).toBe('true');
      expect(row.cells.vocabularyComplete).toBe('false');
      expect(row.cells.hasAudio).toBe('true');
    });
  });

  describe('dirty state tracking', () => {
    it('should mark row dirty when spanish text is modified', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', 'Nuevo texto');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });
    });

    it('should mark row dirty when english text is modified', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'english', 'New text');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });
    });

    it('should mark row dirty when hasAudio is toggled', async () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 1 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });
    });
  });

  describe('discardChanges', () => {
    it('should revert all changes to source data', async () => {
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createMockExampleTechnicalList(1, { spanish: 'Original' }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      act(() => {
        result.current.editTable.discardChanges();
      });

      expect(result.current.editTable.data.rows[0].cells.spanish).toBe(
        'Original',
      );
      expect(result.current.editTable.hasUnsavedChanges).toBe(false);
    });

    it('should revert multiple modified rows', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rows = result.current.editTable.data.rows;
      const originalValues = rows.map((r) => r.cells.spanish);

      act(() => {
        rows.forEach((row, i) => {
          result.current.editTable.updateCell(
            row.id,
            'spanish',
            `Modified ${i}`,
          );
        });
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      act(() => {
        result.current.editTable.discardChanges();
      });

      result.current.editTable.data.rows.forEach((row, i) => {
        expect(row.cells.spanish).toBe(originalValues[i]);
      });
    });
  });

  describe('applyChanges', () => {
    it('should call updateExamples with mapped UpdateExampleCommand', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createMockExampleTechnicalList(1, {
          id: 123,
          spanish: 'Original',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.editTable.applyChanges();
      });

      expect(updateExamplesSpy).toHaveBeenCalled();
      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0].exampleId).toBe(123);
      expect(calledWith[0].spanish).toBe('Modified');
    });

    it('should generate audio URLs when hasAudio is true', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createExamplesWithAudio([{ hasAudio: false, id: 456 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'hasAudio', 'true');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.editTable.applyChanges();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith[0].spanishAudio).toContain('ex456la.mp3');
      expect(calledWith[0].englishAudio).toContain('ex456en.mp3');
    });

    it('should clear audio URLs when hasAudio is false', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });
      vi.mocked(useExamplesToEditQuery).mockReturnValue({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 789 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.editTable.applyChanges();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith[0].spanishAudio).toBe('');
      expect(calledWith[0].englishAudio).toBe('');
    });

    it('should only send dirty rows', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const secondRowId = result.current.editTable.data.rows[1].id;

      act(() => {
        result.current.editTable.updateCell(secondRowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.editTable.applyChanges();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
    });

    it('should set isSaving during save operation', async () => {
      let resolvePromise: () => void;
      const slowSave = new Promise<[]>((resolve) => {
        resolvePromise = () => resolve([]);
      });
      overrideMockExampleAdapter({ updateExamples: () => slowSave });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      let applyPromise: Promise<void>;
      act(() => {
        applyPromise = result.current.editTable.applyChanges();
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        resolvePromise!();
        await applyPromise;
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set saveError on failed save', async () => {
      overrideMockExampleAdapter({
        updateExamples: async () => {
          throw new Error('Network error');
        },
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      try {
        await act(async () => {
          await result.current.editTable.applyChanges();
        });
      } catch {
        // Expected to throw
      }

      await act(async () => {});

      expect(result.current.saveError).toBeInstanceOf(Error);
      expect(result.current.saveError?.message).toBe('Network error');
      expect(result.current.isSaving).toBe(false);
    });

    it('should clear saveError on next save attempt', async () => {
      let callCount = 0;
      overrideMockExampleAdapter({
        updateExamples: async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('First error');
          }
          return [];
        },
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      try {
        await act(async () => {
          await result.current.editTable.applyChanges();
        });
      } catch {
        // Expected to throw
      }

      await act(async () => {});

      expect(result.current.saveError).not.toBeNull();

      await act(async () => {
        await result.current.editTable.applyChanges();
      });

      expect(result.current.saveError).toBeNull();
    });
  });

  describe('validation', () => {
    it('should have valid state initially', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.editTable.validationState.isValid).toBe(true);
    });

    it('should detect invalid state when spanish is cleared', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', '');
      });

      await waitFor(() => {
        expect(result.current.editTable.validationState.isValid).toBe(false);
      });
    });

    it('should detect invalid state when english is cleared', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'english', '');
      });

      await waitFor(() => {
        expect(result.current.editTable.validationState.isValid).toBe(false);
      });
    });

    it('should prevent applyChanges when validation fails', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.editTable.data.rows[0].id;

      act(() => {
        result.current.editTable.updateCell(rowId, 'spanish', '');
      });

      await waitFor(() => {
        expect(result.current.editTable.hasUnsavedChanges).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.editTable.applyChanges();
        }),
      ).rejects.toThrow('validation failed');

      expect(updateExamplesSpy).not.toHaveBeenCalled();
    });
  });
});
