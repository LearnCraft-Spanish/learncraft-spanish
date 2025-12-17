import type { ExampleTechnical } from '@learncraft-spanish/shared';
import {
  mockExampleAdapter,
  overrideMockExampleAdapter,
  resetMockExampleAdapter,
} from '@application/adapters/exampleAdapter.mock';
import { useExampleEditor } from '@application/useCases/useExampleEditor/useExampleEditor';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockExampleTechnicalList } from '@testing/factories/exampleFactory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the example adapter
vi.mock('@application/adapters/exampleAdapter', () => ({
  useExampleAdapter: () => mockExampleAdapter,
}));

describe('useExampleEditor', () => {
  beforeEach(() => {
    resetMockExampleAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper to create examples with specific audio states
   */
  const createExamplesWithAudio = (
    configs: {
      hasAudio: boolean;
      id: number;
    }[],
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
      const examples = createMockExampleTechnicalList(3);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      // Should have 3 rows (no ghost row in edit mode)
      expect(result.current.tableHook.data.rows).toHaveLength(3);
    });

    it('should not have unsaved changes initially', () => {
      const examples = createMockExampleTechnicalList(2);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.saveError).toBeNull();
    });

    it('should expose table columns', () => {
      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const columnIds = result.current.tableHook.data.columns.map((c) => c.id);
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
      const examples = createExamplesWithAudio([{ hasAudio: true, id: 1 }]);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const row = result.current.tableHook.data.rows[0];
      expect(row.cells.hasAudio).toBe('true');
    });

    it('should map examples WITHOUT audio to hasAudio=false', () => {
      const examples = createExamplesWithAudio([{ hasAudio: false, id: 1 }]);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const row = result.current.tableHook.data.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should map examples with only spanishAudio to hasAudio=false', () => {
      const examples = createMockExampleTechnicalList(1, {
        id: 1,
        spanishAudio: 'https://example.com/audio.mp3',
        englishAudio: '', // Missing english audio
      });

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const row = result.current.tableHook.data.rows[0];
      // Both URLs required for hasAudio=true
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should map examples with only englishAudio to hasAudio=false', () => {
      const examples = createMockExampleTechnicalList(1, {
        id: 1,
        spanishAudio: '', // Missing spanish audio
        englishAudio: 'https://example.com/audio.mp3',
      });

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const row = result.current.tableHook.data.rows[0];
      // Both URLs required for hasAudio=true
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should correctly map mixed audio states', () => {
      const examples = createExamplesWithAudio([
        { hasAudio: true, id: 1 },
        { hasAudio: false, id: 2 },
        { hasAudio: true, id: 3 },
      ]);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rows = result.current.tableHook.data.rows;
      expect(rows[0].cells.hasAudio).toBe('true');
      expect(rows[1].cells.hasAudio).toBe('false');
      expect(rows[2].cells.hasAudio).toBe('true');
    });
  });

  describe('field mapping', () => {
    it('should map all ExampleTechnical fields correctly', () => {
      const examples = createMockExampleTechnicalList(1, {
        id: 42,
        spanish: 'Hola mundo',
        english: 'Hello world',
        spanglish: true,
        vocabularyComplete: false,
        spanishAudio: 'https://example.com/ex42la.mp3',
        englishAudio: 'https://example.com/ex42en.mp3',
      });

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const row = result.current.tableHook.data.rows[0];
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
      const examples = createMockExampleTechnicalList(2);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Nuevo texto');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });
    });

    it('should mark row dirty when english text is modified', async () => {
      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'english', 'New text');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });
    });

    it('should mark row dirty when hasAudio is toggled', async () => {
      const examples = createExamplesWithAudio([{ hasAudio: true, id: 1 }]);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });
    });

    it('should clear dirty state when reverted to original value', async () => {
      const examples = createMockExampleTechnicalList(1, {
        spanish: 'Original',
      });

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      // Modify
      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Revert
      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Original');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });

  describe('discardChanges', () => {
    it('should revert all changes to source data', async () => {
      const examples = createMockExampleTechnicalList(1, {
        spanish: 'Original',
      });

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      // Make changes
      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Discard
      act(() => {
        result.current.discardChanges();
      });

      expect(result.current.tableHook.data.rows[0].cells.spanish).toBe(
        'Original',
      );
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should revert multiple modified rows', async () => {
      const examples = createMockExampleTechnicalList(3);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rows = result.current.tableHook.data.rows;
      const originalValues = rows.map((r) => r.cells.spanish);

      // Modify all rows
      act(() => {
        rows.forEach((row, i) => {
          result.current.tableHook.updateCell(
            row.id,
            'spanish',
            `Modified ${i}`,
          );
        });
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Discard
      act(() => {
        result.current.discardChanges();
      });

      // All should be reverted
      result.current.tableHook.data.rows.forEach((row, i) => {
        expect(row.cells.spanish).toBe(originalValues[i]);
      });
    });
  });

  describe('applyChanges', () => {
    it('should call updateExamples with mapped UpdateExampleCommand', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });

      const examples = createMockExampleTechnicalList(1, {
        id: 123,
        spanish: 'Original',
      });

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      // Make changes
      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Apply changes
      await act(async () => {
        await result.current.applyChanges();
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

      // Start with no audio
      const examples = createExamplesWithAudio([{ hasAudio: false, id: 456 }]);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      // Toggle audio on
      act(() => {
        result.current.tableHook.updateCell(rowId, 'hasAudio', 'true');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Apply changes
      await act(async () => {
        await result.current.applyChanges();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith[0].spanishAudio).toContain('ex456la.mp3');
      expect(calledWith[0].englishAudio).toContain('ex456en.mp3');
    });

    it('should clear audio URLs when hasAudio is false', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });

      // Start with audio
      const examples = createExamplesWithAudio([{ hasAudio: true, id: 789 }]);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      // Toggle audio off
      act(() => {
        result.current.tableHook.updateCell(rowId, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Apply changes
      await act(async () => {
        await result.current.applyChanges();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith[0].spanishAudio).toBe('');
      expect(calledWith[0].englishAudio).toBe('');
    });

    it('should only send dirty rows', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });

      const examples = createMockExampleTechnicalList(3);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      // Only modify the second row
      const secondRowId = result.current.tableHook.data.rows[1].id;

      act(() => {
        result.current.tableHook.updateCell(secondRowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.applyChanges();
      });

      // Should only send 1 row
      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
    });

    it('should call onSave callback after successful save', async () => {
      const onSave = vi.fn();
      overrideMockExampleAdapter({
        updateExamples: vi.fn().mockResolvedValue([]),
      });

      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() =>
        useExampleEditor({ examples, onSave }),
      );

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.applyChanges();
      });

      expect(onSave).toHaveBeenCalled();
    });

    it('should set isSaving during save operation', async () => {
      let resolvePromise: () => void;
      const slowSave = new Promise<[]>((resolve) => {
        resolvePromise = () => resolve([]);
      });
      overrideMockExampleAdapter({ updateExamples: () => slowSave });

      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Start save (don't await)
      let applyPromise: Promise<void>;
      act(() => {
        applyPromise = result.current.applyChanges();
      });

      // Should be saving
      expect(result.current.isSaving).toBe(true);

      // Resolve the save
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

      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Apply changes (will fail) - catch the error
      try {
        await act(async () => {
          await result.current.applyChanges();
        });
      } catch {
        // Expected to throw
      }

      // Give React time to flush state updates after error
      await act(async () => {});

      expect(result.current.saveError).toBeInstanceOf(Error);
      expect(result.current.saveError?.message).toBe('Network error');
      expect(result.current.isSaving).toBe(false);
    });

    it('should clear saveError on next save attempt', async () => {
      // Track call count to fail first, succeed second
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

      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // First save fails - catch the error
      try {
        await act(async () => {
          await result.current.applyChanges();
        });
      } catch {
        // Expected to throw
      }

      // Give React time to flush state updates after error
      await act(async () => {});

      expect(result.current.saveError).not.toBeNull();

      // Second save succeeds
      await act(async () => {
        await result.current.applyChanges();
      });

      expect(result.current.saveError).toBeNull();
    });

    it('should not call onSave callback on failed save', async () => {
      const onSave = vi.fn();
      overrideMockExampleAdapter({
        updateExamples: async () => {
          throw new Error('Failed');
        },
      });

      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() =>
        useExampleEditor({ examples, onSave }),
      );

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.applyChanges();
        }),
      ).rejects.toThrow();

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should have valid state initially', () => {
      const examples = createMockExampleTechnicalList(2);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      expect(result.current.tableHook.validationState.isValid).toBe(true);
    });

    it('should detect invalid state when spanish is cleared', async () => {
      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', '');
      });

      await waitFor(() => {
        expect(result.current.tableHook.validationState.isValid).toBe(false);
      });
    });

    it('should detect invalid state when english is cleared', async () => {
      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      act(() => {
        result.current.tableHook.updateCell(rowId, 'english', '');
      });

      await waitFor(() => {
        expect(result.current.tableHook.validationState.isValid).toBe(false);
      });
    });

    it('should prevent applyChanges when validation fails', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideMockExampleAdapter({ updateExamples: updateExamplesSpy });

      const examples = createMockExampleTechnicalList(1);

      const { result } = renderHook(() => useExampleEditor({ examples }));

      const rowId = result.current.tableHook.data.rows[0].id;

      // Make invalid change
      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', '');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.applyChanges();
        }),
      ).rejects.toThrow('validation failed');

      expect(updateExamplesSpy).not.toHaveBeenCalled();
    });
  });

  describe('reactive source data', () => {
    it('should sync non-dirty row values when source examples change', async () => {
      // Create examples with known IDs
      const id1 = 101;
      const id2 = 102;
      const initialExamples = [
        createMockExampleTechnicalList(1, { id: id1, spanish: 'Initial 1' })[0],
        createMockExampleTechnicalList(1, { id: id2, spanish: 'Initial 2' })[0],
      ];

      const { result, rerender } = renderHook(
        ({ examples }) => useExampleEditor({ examples }),
        { initialProps: { examples: initialExamples } },
      );

      expect(result.current.tableHook.data.rows).toHaveLength(2);

      // Update source data with same IDs but different spanish text
      const updatedExamples = [
        createMockExampleTechnicalList(1, {
          id: id1,
          spanish: 'Updated from server 1',
        })[0],
        createMockExampleTechnicalList(1, {
          id: id2,
          spanish: 'Updated from server 2',
        })[0],
      ];

      rerender({ examples: updatedExamples });

      // In edit mode, non-dirty rows sync to source data
      // Row count stays the same (edit mode doesn't add/remove rows reactively)
      expect(result.current.tableHook.data.rows).toHaveLength(2);
    });

    it('should preserve dirty row values when source examples change', async () => {
      const id1 = 201;
      const initialExamples = [
        createMockExampleTechnicalList(1, { id: id1, spanish: 'Initial' })[0],
      ];

      const { result, rerender } = renderHook(
        ({ examples }) => useExampleEditor({ examples }),
        { initialProps: { examples: initialExamples } },
      );

      const rowId = result.current.tableHook.data.rows[0].id;

      // Make the row dirty
      act(() => {
        result.current.tableHook.updateCell(rowId, 'spanish', 'User edit');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Update source data
      const updatedExamples = [
        createMockExampleTechnicalList(1, {
          id: id1,
          spanish: 'Server update',
        })[0],
      ];

      rerender({ examples: updatedExamples });

      // Dirty row should preserve user edit, not sync to server value
      expect(result.current.tableHook.data.rows[0].cells.spanish).toBe(
        'User edit',
      );
    });
  });
});
