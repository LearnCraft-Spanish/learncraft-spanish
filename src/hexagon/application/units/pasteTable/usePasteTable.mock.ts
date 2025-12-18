import type {
  ColumnDefinition,
  TableRow,
  ValidationState,
} from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Utility to create default columns for testing
export const createDefaultColumns = (): ColumnDefinition[] => {
  return [
    { id: 'column1', type: 'text' },
    { id: 'column2', type: 'text' },
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
  columns?: ColumnDefinition[];
  isValid?: boolean;
  isSaveEnabled?: boolean;
}) => {
  const columns = options?.columns || createDefaultColumns();
  const rows = options?.rows || [createDefaultRow()];
  const isValid = options?.isValid ?? true;

  return {
    data: {
      rows,
      columns,
    },
    updateCell: (_rowId: string, _columnId: string, _value: string) => null,
    saveData: () => Promise.resolve(undefined),
    resetTable: () => {},
    importData: (_data: T[]) => {},
    handlePaste: (_e: ClipboardEvent<Element>) => {},
    setActiveCellInfo: (_rowId: string, _columnId: string) => {},
    clearActiveCellInfo: () => {},
    isSaveEnabled: options?.isSaveEnabled ?? isValid,
    validationState: createDefaultValidationState(isValid),
  };
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUsePasteTable,
  override: overrideMockUsePasteTable,
  reset: resetMockUsePasteTable,
} = createOverrideableMock<
  <T>(options: {
    columns: ColumnDefinition[];
    validateRow: (row: T) => Record<string, string>;
    initialData?: T[];
  }) => ReturnType<typeof createMockPasteTableResult>
>(() => createMockPasteTableResult());

// Function to create test data with the expected shape
export const createTestData = <T>(data: Partial<T>[]): T[] => {
  return data as T[];
};

// Export the default result for component testing
export { createMockPasteTableResult as defaultResult };
