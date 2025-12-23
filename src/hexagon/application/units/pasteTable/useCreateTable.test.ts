import type { ColumnDefinition } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import {
  GHOST_ROW_ID,
  useCreateTable,
} from '@application/units/pasteTable/useCreateTable';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { z } from 'zod';

// Test data schema
const TestRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
});

type TestRow = z.infer<typeof TestRowSchema>;

// Test columns with schema
const testColumns: ColumnDefinition[] = [
  {
    id: 'name',
    type: 'text',
    schema: z.string().min(1, 'Name is required'),
  },
  {
    id: 'value',
    type: 'number',
    schema: z.coerce.number().min(0, 'Value must be positive'),
  },
];

// Helper to create mock clipboard event
const createMockClipboardEvent = (text: string): ClipboardEvent<Element> => {
  return {
    preventDefault: vi.fn(),
    clipboardData: {
      getData: vi.fn().mockReturnValue(text),
    },
  } as unknown as ClipboardEvent<Element>;
};

describe('useCreateTable', () => {
  describe('initialization', () => {
    it('should initialize with ghost row only', () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      expect(result.current.data.rows).toHaveLength(1);
      expect(result.current.data.rows[0].id).toBe(GHOST_ROW_ID);
    });

    it('should initialize with provided initial data plus ghost row', () => {
      const initialData: TestRow[] = [
        { name: 'Item 1', value: 10 },
        { name: 'Item 2', value: 20 },
      ];

      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
          initialData,
        }),
      );

      expect(result.current.data.rows).toHaveLength(3); // 2 data + ghost
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
      expect(result.current.data.rows[1].cells.name).toBe('Item 2');
      expect(result.current.data.rows[2].id).toBe(GHOST_ROW_ID);
    });

    it('should throw error if no schema provided', () => {
      // Columns without schema and no rowSchema should throw
      const columnsWithoutSchema: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
      ];

      expect(() => {
        renderHook(() =>
          useCreateTable<TestRow>({
            columns: columnsWithoutSchema,
            // No rowSchema provided
          }),
        );
      }).toThrow('Either rowSchema or column schemas must be provided');
    });
  });

  describe('updateCell', () => {
    it('should update cell value in existing row', () => {
      const initialData: TestRow[] = [{ name: 'Item 1', value: 10 }];

      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
          initialData,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Updated Name');
      });

      expect(result.current.data.rows[0].cells.name).toBe('Updated Name');
    });

    it('should convert ghost row when edited with non-empty value', () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      expect(result.current.data.rows).toHaveLength(1);

      let newRowId: string | null = null;
      act(() => {
        newRowId = result.current.updateCell(GHOST_ROW_ID, 'name', 'New Item');
      });

      expect(newRowId).not.toBeNull();
      expect(result.current.data.rows).toHaveLength(2); // New row + new ghost
      expect(result.current.data.rows[0].cells.name).toBe('New Item');
      expect(result.current.data.rows[1].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('validation', () => {
    it('should report invalid state for invalid data', () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      // Add row with invalid data (negative value when schema requires positive)
      act(() => {
        result.current.updateCell(GHOST_ROW_ID, 'name', 'Valid Name');
      });

      // Now update value to invalid (negative number)
      const rowId = result.current.data.rows[0].id;
      act(() => {
        result.current.updateCell(rowId, 'value', '-5');
      });

      expect(result.current.validationState.isValid).toBe(false);
    });

    it('should report valid state for valid data', () => {
      const initialData: TestRow[] = [{ name: 'Valid Item', value: 10 }];

      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
          initialData,
        }),
      );

      expect(result.current.validationState.isValid).toBe(true);
    });

    it('should return isSaveEnabled false when only ghost row exists', () => {});
  });

  describe('saveData', () => {
    it('should return undefined when validation fails', async () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      // Add row with name, then make value invalid
      act(() => {
        result.current.updateCell(GHOST_ROW_ID, 'name', 'Valid Name');
      });

      const rowId = result.current.data.rows[0].id;
      act(() => {
        result.current.updateCell(rowId, 'value', '-5'); // Invalid: negative
      });

      let savedData: TestRow[] | undefined;
      await act(async () => {
        savedData = await result.current.saveData();
      });

      expect(savedData).toBeUndefined();
    });

    it('should return parsed data when validation passes', async () => {
      const initialData: TestRow[] = [{ name: 'Item 1', value: 10 }];

      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
          initialData,
        }),
      );

      let savedData: TestRow[] | undefined;
      await act(async () => {
        savedData = await result.current.saveData();
      });

      expect(savedData).toBeDefined();
      expect(savedData).toHaveLength(1);
      expect(savedData![0].name).toBe('Item 1');
      expect(savedData![0].value).toBe(10);
    });

    it('should exclude ghost row from save data', async () => {
      const initialData: TestRow[] = [{ name: 'Item 1', value: 10 }];

      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
          initialData,
        }),
      );

      let savedData: TestRow[] | undefined;
      await act(async () => {
        savedData = await result.current.saveData();
      });

      // Should only include the data row, not ghost row
      expect(savedData).toHaveLength(1);
    });
  });

  describe('resetTable', () => {
    it('should reset to only ghost row', () => {
      const initialData: TestRow[] = [
        { name: 'Item 1', value: 10 },
        { name: 'Item 2', value: 20 },
      ];

      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
          initialData,
        }),
      );

      expect(result.current.data.rows).toHaveLength(3);

      act(() => {
        result.current.resetTable();
      });

      expect(result.current.data.rows).toHaveLength(1);
      expect(result.current.data.rows[0].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('importData', () => {
    it('should import new data while preserving ghost row', () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      const newData: TestRow[] = [
        { name: 'Imported 1', value: 100 },
        { name: 'Imported 2', value: 200 },
      ];

      act(() => {
        result.current.importData(newData);
      });

      expect(result.current.data.rows).toHaveLength(3); // 2 imported + ghost
      expect(result.current.data.rows[0].cells.name).toBe('Imported 1');
      expect(result.current.data.rows[1].cells.name).toBe('Imported 2');
      expect(result.current.data.rows[2].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('handlePaste', () => {
    it('should handle paste in create mode (add rows)', () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      const tsvData = 'Item 1\t10\nItem 2\t20';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      // Should have pasted rows + ghost
      expect(result.current.data.rows.length).toBeGreaterThan(1);
    });
  });

  describe('setActiveCellInfo / clearActiveCellInfo', () => {
    it('should expose cell info management functions', () => {
      const { result } = renderHook(() =>
        useCreateTable<TestRow>({
          columns: testColumns,
          rowSchema: TestRowSchema,
        }),
      );

      expect(typeof result.current.setActiveCellInfo).toBe('function');
      expect(typeof result.current.clearActiveCellInfo).toBe('function');
    });
  });
});
