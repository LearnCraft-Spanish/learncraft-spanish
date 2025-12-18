import type { TableRow } from '@domain/PasteTable';
import { useDirtyStateTracking } from '@application/units/pasteTable/hooks/useDirtyStateTracking';
import { renderHook } from '@testing-library/react';

// Helper to create test rows
const createTestRow = (
  id: string,
  cells: Record<string, string>,
): TableRow => ({
  id,
  cells,
});

describe('useDirtyStateTracking', () => {
  const defaultIdColumnId = 'id';

  describe('initial state', () => {
    it('should return empty dirty set when rows match cleanRows', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Item 1' }),
        createTestRow('row-2', { id: '2', name: 'Item 2' }),
      ];
      const cleanRows = [...rows];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: defaultIdColumnId,
        }),
      );

      expect(result.current.dirtyRowIds.size).toBe(0);
    });

    it('should detect dirty rows on initialization', () => {
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

      expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
    });
  });

  describe('dirty detection by row ID', () => {
    it('should match rows by row ID when comparing', () => {
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

      expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
    });

    it('should match rows by domain ID when row IDs differ', () => {
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

      expect(result.current.dirtyRowIds.has('new-row-id')).toBe(true);
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

    it('should clear dirty state when row reverts to clean value', () => {
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

      expect(result.current.dirtyRowIds.has('row-1')).toBe(true);

      // Revert to original
      const revertedRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original' }),
      ];

      rerender({ rows: revertedRows });

      expect(result.current.dirtyRowIds.has('row-1')).toBe(false);
    });
  });

  describe('editableColumnIds filter', () => {
    it('should only compare specified columns when editableColumnIds provided', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Same', readonly: 'Changed' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Same', readonly: 'Original' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: 'id',
          editableColumnIds: ['name'], // Only compare 'name', ignore 'readonly'
        }),
      );

      // Should NOT be dirty because 'name' is the same
      expect(result.current.dirtyRowIds.has('row-1')).toBe(false);
    });

    it('should detect dirty when editable column changes', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Changed', readonly: 'Same' }),
      ];
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Original', readonly: 'Same' }),
      ];

      const { result } = renderHook(() =>
        useDirtyStateTracking({
          rows,
          cleanRows,
          idColumnId: 'id',
          editableColumnIds: ['name'],
        }),
      );

      expect(result.current.dirtyRowIds.has('row-1')).toBe(true);
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
