import type { TableRow } from '@domain/PasteTable/types';
import { useDirtyStateTracking } from '@application/units/pasteTable/hooks/useDirtyStateTracking';
import { act, renderHook, waitFor } from '@testing-library/react';

// Helper to create test rows
const createTestRow = (id: string, cells: Record<string, string>): TableRow => ({
  id,
  cells,
});

describe('useDirtyStateTracking', () => {
  const defaultIdColumnId = 'id';

  describe('initial state', () => {
    it('should initialize with empty dirty set when rows match cleanRows', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Item 1' }),
        createTestRow('row-2', { id: '2', name: 'Item 2' }),
      ];
      const cleanRows = [...rows]; // Same reference content

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      expect(result.current.dirtyRowIds.size).toBe(0);
    });

    it('should detect dirty rows on initialization', async () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Modified' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      // State sync happens asynchronously during render
      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
      });
    });
  });

  describe('dirty detection by row ID', () => {
    it('should match rows by row ID when comparing', async () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Changed' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
      });
    });

    it('should match rows by domain ID when row IDs differ', async () => {
      const rows: TableRow[] = [
        createTestRow('new-row-id', { id: '1', name: 'Changed' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('original-row-id', { id: '1', name: 'Original' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('new-row-id')).toBe(true);
      });
    });
  });

  describe('markRowDirty', () => {
    it('should manually mark a row as dirty', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Item 1' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Item 1' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      expect(result.current.dirtyRowIds.has('row-1')).toBe(false);

      act(() => {
        result.current.markRowDirty('row-1');
      });

      expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
    });

    it('should handle marking non-existent row', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Item 1' }),
      ];
      const cleanRows = [...rows];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      act(() => {
        result.current.markRowDirty('non-existent');
      });

      expect(result.current.dirtyRowIds.has('non-existent')).toBe(true);
    });
  });

  describe('clearDirtyRows', () => {
    it('should clear specific rows from dirty set', async () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Changed 1' }),
        createTestRow('row-2', { id: '2', name: 'Changed 2' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original 1' }),
        createTestRow('row-2', { id: '2', name: 'Original 2' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
        expect(result.current.dirtyRowIds.has('row-2')).toBe(true);
      });

      act(() => {
        result.current.clearDirtyRows(['row-1']);
      });

      expect(result.current.dirtyRowIds.has('row-1')).toBe(false);
      expect(result.current.dirtyRowIds.has('row-2')).toBe(true);
    });

    it('should clear multiple rows at once', async () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Changed 1' }),
        createTestRow('row-2', { id: '2', name: 'Changed 2' }),
        createTestRow('row-3', { id: '3', name: 'Changed 3' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original 1' }),
        createTestRow('row-2', { id: '2', name: 'Original 2' }),
        createTestRow('row-3', { id: '3', name: 'Original 3' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      await waitFor(() => {
        expect(result.current.dirtyRowIds.size).toBe(3);
      });

      act(() => {
        result.current.clearDirtyRows(['row-1', 'row-3']);
      });

      expect(result.current.dirtyRowIds.has('row-1')).toBe(false);
      expect(result.current.dirtyRowIds.has('row-2')).toBe(true);
      expect(result.current.dirtyRowIds.has('row-3')).toBe(false);
    });
  });

  describe('clearAllDirty', () => {
    it('should clear all dirty state', async () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Changed 1' }),
        createTestRow('row-2', { id: '2', name: 'Changed 2' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original 1' }),
        createTestRow('row-2', { id: '2', name: 'Original 2' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      await waitFor(() => {
        expect(result.current.dirtyRowIds.size).toBe(2);
      });

      act(() => {
        result.current.clearAllDirty();
      });

      expect(result.current.dirtyRowIds.size).toBe(0);
    });
  });

  describe('reactive dirty detection', () => {
    it('should update dirty state when rows change', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      const initialRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      const { result, rerender } = renderHook(
        ({ rows }) =>
          useDirtyStateTracking({
            rows,
            cleanRows,
            idColumnId: defaultIdColumnId,
          }),
        { initialProps: { rows: initialRows } },
      );

      expect(result.current.dirtyRowIds.size).toBe(0);

      // Modify the row
      const modifiedRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Modified' }),
      ];

      rerender({ rows: modifiedRows });

      expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
    });

    it('should clear dirty state when row reverts to clean value', async () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      const dirtyRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Modified' }),
      ];

      const { result, rerender } = renderHook(
        ({ rows }) =>
          useDirtyStateTracking({
            rows,
            cleanRows,
            idColumnId: defaultIdColumnId,
          }),
        { initialProps: { rows: dirtyRows } },
      );

      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
      });

      // Revert to original
      const revertedRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      rerender({ rows: revertedRows });

      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('row-1')).toBe(false);
      });
    });
  });

  describe('custom idColumnId', () => {
    it('should use custom idColumnId for matching', async () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { vocabId: '100', name: 'Changed' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('different-row-id', { vocabId: '100', name: 'Original' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: 'vocabId',
        }),
      );

      // Should match by vocabId and detect the change
      await waitFor(() => {
        expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty rows array', () => {
      const rows: TableRow[] = [];
      const cleanRows: TableRow[] = [];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      expect(result.current.dirtyRowIds.size).toBe(0);
    });

    it('should handle row not found in cleanRows', () => {
      const rows: TableRow[] = [
        createTestRow('new-row', { id: '999', name: 'New Row' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      // New row without matching clean row should not be dirty
      expect(result.current.dirtyRowIds.has('new-row')).toBe(false);
    });
  });
});

