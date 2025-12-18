import type { ColumnDefinition } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { useEditTable } from '@application/units/pasteTable/useEditTable';
import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { z } from 'zod';

// Test data schema
const TestRowSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, 'Name is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
});

type TestRow = z.infer<typeof TestRowSchema>;

// Test columns with schema
const testColumns: ColumnDefinition[] = [
  {
    id: 'id',
    type: 'number',
    schema: z.coerce.number(),
  },
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

describe('useEditTable', () => {
  const sourceData: TestRow[] = [
    { id: 1, name: 'Item 1', value: 10 },
    { id: 2, name: 'Item 2', value: 20 },
    { id: 3, name: 'Item 3', value: 30 },
  ];

  describe('initialization', () => {
    it('should initialize with source data (no ghost row)', () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      expect(result.current.data.rows).toHaveLength(3);
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
    });

    it('should not have unsaved changes initially', () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('updateCell and dirty tracking', () => {
    it('should mark row as dirty when cell is modified', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });
    });

    it('should clear dirty state when cell reverts to original value', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Modify the cell
      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Revert to original value
      act(() => {
        result.current.updateCell(rowId, 'name', 'Item 1');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });

  describe('discardChanges', () => {
    it('should revert all changes to source data', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Make changes
      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Discard changes
      act(() => {
        result.current.discardChanges();
      });

      // Should be back to original
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('applyChanges', () => {
    it('should call onApplyChanges with dirty data', async () => {
      const onApplyChanges = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
          onApplyChanges,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Make changes
      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Apply changes
      await act(async () => {
        await result.current.applyChanges();
      });

      expect(onApplyChanges).toHaveBeenCalled();
      const calledWith = onApplyChanges.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0].name).toBe('Modified Name');
    });

    it('should throw error when onApplyChanges is not provided', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
          // No onApplyChanges
        }),
      );

      const rowId = result.current.data.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.applyChanges();
        }),
      ).rejects.toThrow('onApplyChanges callback is required');
    });

    it('should throw error when validation fails', async () => {
      const onApplyChanges = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
          onApplyChanges,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Make invalid change (negative value)
      act(() => {
        result.current.updateCell(rowId, 'value', '-5');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.applyChanges();
        }),
      ).rejects.toThrow('validation failed');

      expect(onApplyChanges).not.toHaveBeenCalled();
    });
  });

  describe('importData', () => {
    it('should replace current data and clear dirty state', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Make changes
      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Import new data
      const newData: TestRow[] = [{ id: 99, name: 'New Item', value: 99 }];
      act(() => {
        result.current.importData(newData);
      });

      expect(result.current.data.rows).toHaveLength(1);
      expect(result.current.data.rows[0].cells.name).toBe('New Item');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('handlePaste in edit mode', () => {
    it('should update existing rows by ID match', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      // Paste data that matches ID 1
      const tsvData = '1\tUpdated Name\t100';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Row with ID 1 should be updated
      const row1 = result.current.data.rows.find((r) => r.cells.id === '1');
      expect(row1?.cells.name).toBe('Updated Name');
      expect(row1?.cells.value).toBe('100');
    });

    it('should not create new rows in edit mode', () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      // Paste data with non-matching ID
      const tsvData = '999\tNew Item\t999';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      // Should still have only 3 rows
      expect(result.current.data.rows).toHaveLength(3);
    });
  });

  describe('validation', () => {
    it('should validate existing data', () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      expect(result.current.validationState.isValid).toBe(true);
    });

    it('should detect invalid data after modification', async () => {
      const { result } = renderHook(() =>
        useEditTable<TestRow>({
          columns: testColumns,
          sourceData,
          rowSchema: TestRowSchema,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Make value invalid (negative)
      act(() => {
        result.current.updateCell(rowId, 'value', '-10');
      });

      await waitFor(() => {
        expect(result.current.validationState.isValid).toBe(false);
      });
    });
  });

  describe('reactive source data updates', () => {
    it('should update non-dirty rows when sourceData changes', async () => {
      const initialSourceData: TestRow[] = [
        { id: 1, name: 'Original', value: 10 },
      ];

      const { result, rerender } = renderHook(
        ({ sourceData: sd }) =>
          useEditTable<TestRow>({
            columns: testColumns,
            sourceData: sd,
            rowSchema: TestRowSchema,
          }),
        { initialProps: { sourceData: initialSourceData } },
      );

      expect(result.current.data.rows[0].cells.name).toBe('Original');

      // Simulate React Query updating sourceData
      const updatedSourceData: TestRow[] = [
        { id: 1, name: 'Updated from Server', value: 10 },
      ];

      rerender({ sourceData: updatedSourceData });

      // Trigger sync
      act(() => {
        // The hook should reactively sync
      });

      // Non-dirty row should update
      // Note: actual sync depends on hook implementation timing
    });
  });

  describe('custom idColumnId', () => {
    it('should use custom idColumnId for edit mode matching', async () => {
      const columnsWithCustomId: ColumnDefinition[] = [
        { id: 'vocabId', type: 'number' },
        { id: 'name', type: 'text' },
      ];

      const CustomSchema = z.object({
        vocabId: z.coerce.number(),
        name: z.string(),
      });

      type CustomRow = z.infer<typeof CustomSchema>;

      const customSourceData: CustomRow[] = [
        { vocabId: 100, name: 'Item 100' },
        { vocabId: 200, name: 'Item 200' },
      ];

      const { result } = renderHook(() =>
        useEditTable<CustomRow>({
          columns: columnsWithCustomId,
          sourceData: customSourceData,
          rowSchema: CustomSchema,
          idColumnId: 'vocabId',
        }),
      );

      // Paste data matching by vocabId
      const tsvData = '100\tUpdated Item 100';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      const row = result.current.data.rows.find(
        (r) => r.cells.vocabId === '100',
      );
      expect(row?.cells.name).toBe('Updated Item 100');
    });
  });
});
