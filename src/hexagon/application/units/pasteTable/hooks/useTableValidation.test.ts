import type { TableRow } from '@domain/PasteTable';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useTableValidation } from '@application/units/pasteTable/hooks/useTableValidation';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// Helper to create test rows
const createTestRow = (
  id: string,
  cells: Record<string, string>,
): TableRow => ({
  id,
  cells,
});

const createGhostRow = (): TableRow => ({
  id: GHOST_ROW_ID,
  cells: { name: '', value: '' },
});

describe('useTableValidation', () => {
  describe('with all valid rows', () => {
    it('should return isValid true when all rows pass validation', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createTestRow('row-2', { name: 'Item 2', value: '20' }),
        createGhostRow(),
      ];

      // Validator that always passes
      const validateRow = (): Record<string, string> => ({});

      const { result } = renderHook(() =>
        useTableValidation({ rows, validateRow }),
      );

      expect(result.current.validationState.isValid).toBe(true);
      expect(result.current.validationState.errors).toEqual({});
    });
  });

  describe('with invalid rows', () => {
    it('should return isValid false when any row fails validation', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createTestRow('row-2', { name: '', value: '20' }), // Invalid - empty name
        createGhostRow(),
      ];

      // Validator that requires non-empty name
      const validateRow = (row: TableRow): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!row.cells.name) {
          errors.name = 'Name is required';
        }
        return errors;
      };

      const { result } = renderHook(() =>
        useTableValidation({ rows, validateRow }),
      );

      expect(result.current.validationState.isValid).toBe(false);
      expect(result.current.validationState.errors['row-2']).toEqual({
        name: 'Name is required',
      });
    });

    it('should return errors for each invalid row', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: '', value: '10' }),
        createTestRow('row-2', { name: '', value: '20' }),
        createGhostRow(),
      ];

      const validateRow = (row: TableRow): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!row.cells.name) {
          errors.name = 'Name is required';
        }
        return errors;
      };

      const { result } = renderHook(() =>
        useTableValidation({ rows, validateRow }),
      );

      expect(result.current.validationState.errors['row-1']).toEqual({
        name: 'Name is required',
      });
      expect(result.current.validationState.errors['row-2']).toEqual({
        name: 'Name is required',
      });
    });
  });

  describe('ghost row handling', () => {
    it('should skip validation for ghost row', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createGhostRow(), // Ghost row has empty cells
      ];

      // Validator that would fail on empty cells
      const validateRow = (row: TableRow): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!row.cells.name) errors.name = 'Required';
        if (!row.cells.value) errors.value = 'Required';
        return errors;
      };

      const { result } = renderHook(() =>
        useTableValidation({ rows, validateRow }),
      );

      // Should be valid because ghost row is skipped
      expect(result.current.validationState.isValid).toBe(true);
      expect(
        result.current.validationState.errors[GHOST_ROW_ID],
      ).toBeUndefined();
    });
  });

  describe('reactive validation', () => {
    it('should update validation when rows change', () => {
      const validateRow = (row: TableRow): Record<string, string> => {
        if (!row.cells.name) return { name: 'Required' };
        return {};
      };

      const initialRows: TableRow[] = [
        createTestRow('row-1', { name: '', value: '10' }),
        createGhostRow(),
      ];

      const { result, rerender } = renderHook(
        ({ rows }) => useTableValidation({ rows, validateRow }),
        { initialProps: { rows: initialRows } },
      );

      // Initially invalid
      expect(result.current.validationState.isValid).toBe(false);

      // Update rows with valid data
      const updatedRows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];

      rerender({ rows: updatedRows });

      // Should now be valid
      expect(result.current.validationState.isValid).toBe(true);
    });

    it('should clear errors when row becomes valid', () => {
      const validateRow = (row: TableRow): Record<string, string> => {
        if (!row.cells.name) return { name: 'Required' };
        return {};
      };

      const initialRows: TableRow[] = [
        createTestRow('row-1', { name: '', value: '10' }),
        createGhostRow(),
      ];

      const { result, rerender } = renderHook(
        ({ rows }) => useTableValidation({ rows, validateRow }),
        { initialProps: { rows: initialRows } },
      );

      // Has errors initially
      expect(result.current.validationState.errors['row-1']).toBeDefined();

      // Fix the row
      const fixedRows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];

      rerender({ rows: fixedRows });

      // Errors should be cleared
      expect(result.current.validationState.errors['row-1']).toBeUndefined();
    });
  });

  describe('multiple error fields', () => {
    it('should capture multiple errors per row', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: '', value: '' }),
        createGhostRow(),
      ];

      const validateRow = (row: TableRow): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!row.cells.name) errors.name = 'Name is required';
        if (!row.cells.value) errors.value = 'Value is required';
        return errors;
      };

      const { result } = renderHook(() =>
        useTableValidation({ rows, validateRow }),
      );

      expect(result.current.validationState.errors['row-1']).toEqual({
        name: 'Name is required',
        value: 'Value is required',
      });
    });
  });

  describe('error reporting', () => {
    const requireName = (row: TableRow): Record<string, string> =>
      row.cells.name ? {} : { name: 'Name is required' };

    it('should report only the invalid rows in errors', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createTestRow('row-2', { name: '', value: '20' }),
        createTestRow('row-3', { name: 'Item 3', value: '30' }),
      ];

      const { result } = renderHook(() =>
        useTableValidation({ rows, validateRow: requireName }),
      );

      expect(result.current.validationState).toEqual({
        isValid: false,
        errors: { 'row-2': { name: 'Name is required' } },
      });
    });

    it('should treat a table with no rows as valid', () => {
      const { result } = renderHook(() =>
        useTableValidation({ rows: [], validateRow: requireName }),
      );

      expect(result.current.validationState).toEqual({
        isValid: true,
        errors: {},
      });
    });

    it('should treat a table with only the ghost row as valid', () => {
      const { result } = renderHook(() =>
        useTableValidation({
          rows: [createGhostRow()],
          validateRow: requireName,
        }),
      );

      expect(result.current.validationState.isValid).toBe(true);
    });

    it('should hand each real row to the validator and never the ghost row', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];
      const validateRow = vi.fn(() => ({}));

      renderHook(() => useTableValidation({ rows, validateRow }));

      expect(validateRow).toHaveBeenCalledWith(rows[0]);
      expect(validateRow).not.toHaveBeenCalledWith(rows[1]);
    });

    it('should re-validate when the validator itself changes', () => {
      const rows: TableRow[] = [
        createTestRow('row-1', { name: 'Item 1', value: '10' }),
      ];

      const { result, rerender } = renderHook(
        ({ validateRow }) => useTableValidation({ rows, validateRow }),
        {
          initialProps: {
            validateRow: (): Record<string, string> => ({}),
          },
        },
      );
      expect(result.current.validationState.isValid).toBe(true);

      rerender({ validateRow: () => ({ value: 'Too small' }) });

      expect(result.current.validationState).toEqual({
        isValid: false,
        errors: { 'row-1': { value: 'Too small' } },
      });
    });
  });
});
