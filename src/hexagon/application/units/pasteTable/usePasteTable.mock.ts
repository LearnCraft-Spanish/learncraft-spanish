import type { ClipboardEvent } from 'react';
import type {
  TableColumn,
  TableHook,
  TableRow,
  ValidationState,
} from './types';
import { createTypedMock } from '@testing/utils/typedMock';

// Utility to create default columns for testing
export const createDefaultColumns = (): TableColumn[] => {
  return [
    { id: 'column1', label: 'Column 1', width: '1fr', type: 'text' },
    { id: 'column2', label: 'Column 2', width: '1fr', type: 'text' },
  ];
};

// Default row for testing
export const createDefaultRow = (id: string = 'row-1'): TableRow => ({
  id,
  cells: {
    column1: 'value1',
    column2: 'value2',
  },
});

// Default validation state (valid)
export const createDefaultValidationState = (
  isValid: boolean = true,
): ValidationState => ({
  isValid,
  errors: {},
});

// Factory function to create a mock PasteTable hook result
export const createMockPasteTableResult = <T>(options?: {
  rows?: TableRow[];
  columns?: TableColumn[];
  isValid?: boolean;
  isSaveEnabled?: boolean;
}): TableHook<T> => {
  const columns = options?.columns || createDefaultColumns();
  const rows = options?.rows || [createDefaultRow()];
  const isValid = options?.isValid ?? true;

  return {
    data: {
      rows,
      columns,
    },
    updateCell: createTypedMock<
      (rowId: string, columnId: string, value: string) => string | null
    >().mockImplementation(() => null),
    saveData:
      createTypedMock<() => Promise<T[] | undefined>>().mockResolvedValue(
        undefined,
      ),
    resetTable: createTypedMock<() => void>().mockImplementation(() => {}),
    importData: createTypedMock<(data: T[]) => void>().mockImplementation(
      () => {},
    ),
    handlePaste: createTypedMock<
      (e: ClipboardEvent<Element>) => void
    >().mockImplementation(() => {}),
    setActiveCellInfo: createTypedMock<
      (rowId: string, columnId: string) => void
    >().mockImplementation(() => {}),
    clearActiveCellInfo: createTypedMock<() => void>().mockImplementation(
      () => {},
    ),
    isSaveEnabled: options?.isSaveEnabled ?? isValid,
    validationState: createDefaultValidationState(isValid),
  };
};

// Main mock function for the usePasteTable hook
export const mockUsePasteTable = createTypedMock<
  <T>(options: {
    columns: TableColumn[];
    validateRow: (row: T) => Record<string, string>;
    initialData?: T[];
  }) => TableHook<T>
>().mockImplementation(() => createMockPasteTableResult());

/**
 * Override the usePasteTable mock with custom values
 * @param config Additional configuration to override default mock values
 * @returns The customized mock result
 */
export const overrideMockUsePasteTable = <T>(
  config: Partial<TableHook<T>> = {},
) => {
  const defaultResult = createMockPasteTableResult<T>();

  // Create a new result with defaults and overrides
  const mockResult = {
    ...defaultResult,
    ...config,

    // Allow deep merge of data if provided
    ...(config.data && {
      data: {
        ...defaultResult.data,
        ...config.data,
        // Further handle rows and columns if provided
        ...(config.data.rows && {
          rows: config.data.rows,
        }),
        ...(config.data.columns && {
          columns: config.data.columns,
        }),
      },
    }),

    // Allow deep merge of validationState if provided
    ...(config.validationState && {
      validationState: {
        ...defaultResult.validationState,
        ...config.validationState,
      },
    }),
  };

  // Update the mock implementation
  mockUsePasteTable.mockImplementation(() => mockResult as any);

  return mockResult;
};

// Function to create test data with the expected shape
export const createTestData = <T>(data: Partial<T>[]): T[] => {
  return data as T[];
};
