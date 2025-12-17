import type { TableRow } from '@domain/PasteTable/types';
import { useCleanStateSync } from '@application/units/pasteTable/hooks/useCleanStateSync';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// Helper to create test rows
const createTestRow = (
  id: string,
  cells: Record<string, string>,
): TableRow => ({
  id,
  cells,
});

describe('useCleanStateSync', () => {
  const defaultIdColumnId = 'id';

  describe('syncRowsToCleanState', () => {
    it('should sync non-dirty rows to clean state', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Updated Clean' }),
        createTestRow('row-2', { id: '2', name: 'Updated Clean 2' }),
      ];

      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Old Value' }),
        createTestRow('row-2', { id: '2', name: 'Old Value 2' }),
      ];

      const dirtyRowIds = new Set<string>(); // No dirty rows
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      expect(setRows).toHaveBeenCalled();
      // Extract the updater function that was passed to setRows
      const updater = setRows.mock.calls[0][0];
      const updatedRows = updater(rows);

      // Non-dirty rows should be updated to clean state
      expect(updatedRows[0].cells.name).toBe('Updated Clean');
      expect(updatedRows[1].cells.name).toBe('Updated Clean 2');
    });

    it('should preserve dirty rows during sync', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Clean Value' }),
        createTestRow('row-2', { id: '2', name: 'Clean Value 2' }),
      ];

      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'User Edit' }), // User is editing this
        createTestRow('row-2', { id: '2', name: 'Old Value 2' }),
      ];

      const dirtyRowIds = new Set<string>(['row-1']); // row-1 is dirty
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      const updater = setRows.mock.calls[0][0];
      const updatedRows = updater(rows);

      // Dirty row should keep user's edit
      expect(updatedRows[0].cells.name).toBe('User Edit');
      // Non-dirty row should sync to clean
      expect(updatedRows[1].cells.name).toBe('Clean Value 2');
    });

    it('should match rows by domain ID when row IDs differ', () => {
      const cleanRows: TableRow[] = [
        createTestRow('clean-row-id', { id: '1', name: 'Clean Value' }),
      ];

      const rows: TableRow[] = [
        createTestRow('current-row-id', { id: '1', name: 'Old Value' }),
      ];

      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      const updater = setRows.mock.calls[0][0];
      const updatedRows = updater(rows);

      // Should find match by domain ID and sync
      expect(updatedRows[0].cells.name).toBe('Clean Value');
    });

    it('should add new rows from cleanRows that do not exist', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Existing' }),
        createTestRow('row-2', { id: '2', name: 'New Row' }), // New row
      ];

      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Existing' }),
      ];

      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      const updater = setRows.mock.calls[0][0];
      const updatedRows = updater(rows);

      expect(updatedRows).toHaveLength(2);
      expect(updatedRows[1].id).toBe('row-2');
      expect(updatedRows[1].cells.name).toBe('New Row');
    });

    it('should not call setRows when cleanRows is empty', () => {
      const cleanRows: TableRow[] = [];
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Value' }),
      ];

      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      expect(setRows).not.toHaveBeenCalled();
    });

    it('should not call setRows when rows is empty', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Value' }),
      ];
      const rows: TableRow[] = [];

      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      expect(setRows).not.toHaveBeenCalled();
    });
  });

  describe('custom idColumnId', () => {
    it('should use custom idColumnId for row matching', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { vocabId: '100', name: 'Clean Value' }),
      ];

      const rows: TableRow[] = [
        createTestRow('different-id', { vocabId: '100', name: 'Old Value' }),
      ];

      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: 'vocabId',
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      const updater = setRows.mock.calls[0][0];
      const updatedRows = updater(rows);

      // Should match by vocabId and sync
      expect(updatedRows[0].cells.name).toBe('Clean Value');
    });
  });

  describe('edge cases', () => {
    it('should keep current row when no matching clean row found', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Clean Value' }),
      ];

      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Will Sync' }),
        createTestRow('row-99', { id: '99', name: 'No Match' }), // No matching clean row
      ];

      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result } = renderHook(() =>
        useCleanStateSync({
          cleanRows,
          rows,
          dirtyRowIds,
          idColumnId: defaultIdColumnId,
          setRows,
        }),
      );

      act(() => {
        result.current.syncRowsToCleanState();
      });

      const updater = setRows.mock.calls[0][0];
      const updatedRows = updater(rows);

      // First row syncs, second row stays as-is
      expect(updatedRows[0].cells.name).toBe('Clean Value');
      expect(updatedRows[1].cells.name).toBe('No Match');
    });
  });

  describe('function stability', () => {
    it('should return stable syncRowsToCleanState reference', () => {
      const cleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Clean' }),
      ];
      const rows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'Current' }),
      ];
      const dirtyRowIds = new Set<string>();
      const setRows = vi.fn();

      const { result, rerender } = renderHook(
        ({ cleanRows: cr }) =>
          useCleanStateSync({
            cleanRows: cr,
            rows,
            dirtyRowIds,
            idColumnId: defaultIdColumnId,
            setRows,
          }),
        { initialProps: { cleanRows } },
      );

      const firstRef = result.current.syncRowsToCleanState;

      // Rerender with different cleanRows
      const newCleanRows: TableRow[] = [
        createTestRow('row-1', { id: '1', name: 'New Clean' }),
      ];
      rerender({ cleanRows: newCleanRows });

      const secondRef = result.current.syncRowsToCleanState;

      // Function reference should change when dependencies change
      expect(firstRef).not.toBe(secondRef);
    });
  });
});
