import type { CreateTableStateHook } from '@application/units/pasteTable/useCreateTableState';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CreateExampleCommand,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useExampleCreator } from '@application/useCases/useExampleCreator/useExampleCreator';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface CreateTableOptions {
  initialRows?: TableRow[];
  columns: ColumnDefinition[];
}

interface ValidationOptions {
  rows: TableRow[];
  validateRow: (row: TableRow) => Record<string, string>;
}

const ghostRow: TableRow = {
  id: GHOST_ROW_ID,
  cells: { spanish: '', english: '' },
};

let seededRows: TableRow[] = [];
let latestCreateTable: CreateTableStateHook | undefined;
let latestCreateOptions: CreateTableOptions | undefined;

function createdExample(id: number, spanish: string): ExampleWithVocabulary {
  const [base] = createMockExampleWithVocabularyList(1);
  return { ...base, id, spanish };
}

function dataRow(id: string, spanish: string, english: string): TableRow {
  return { id, cells: { spanish, english } };
}

function withGhost(rows: TableRow[]): TableRow[] {
  if (rows.some((row) => row.id === GHOST_ROW_ID)) {
    return rows;
  }
  return [...rows, ghostRow];
}

function buildCreateTable(options: CreateTableOptions): CreateTableStateHook {
  latestCreateOptions = options;
  const rows = withGhost(seededRows);
  const table: CreateTableStateHook = {
    data: {
      rows,
      columns: options.columns,
    },
    updateCell: vi.fn(() => null),
    handlePaste: vi.fn(),
    resetTable: vi.fn(),
    activeCell: { rowId: 'focus-row', columnId: 'spanish' },
    setActiveCell: vi.fn(),
    setActiveCellInfo: vi.fn(),
    clearActiveCellInfo: vi.fn(),
    getRows: () => rows,
    setRows: vi.fn(),
  };
  latestCreateTable = table;
  return table;
}

function buildValidation(options: ValidationOptions): {
  validationState: {
    isValid: boolean;
    errors: Record<string, Record<string, string>>;
  };
} {
  const errors: Record<string, Record<string, string>> = {};
  options.rows.forEach((row) => {
    if (row.id === GHOST_ROW_ID) {
      return;
    }
    const rowErrors = options.validateRow(row);
    if (Object.keys(rowErrors).length > 0) {
      errors[row.id] = rowErrors;
    }
  });
  return {
    validationState: {
      isValid: Object.keys(errors).length === 0,
      errors,
    },
  };
}

const {
  mock: exampleMutations,
  override: overrideExampleMutations,
  reset: resetExampleMutations,
} = createOverrideableMock({
  createExamples: async (
    _commands: CreateExampleCommand[],
  ): Promise<ExampleWithVocabulary[]> => [],
  examplesCreating: false,
  examplesCreatingError: null as Error | null,
  updateExamples: async (): Promise<ExampleWithVocabulary[]> => [],
  examplesUpdating: false,
  examplesUpdatingError: null as Error | null,
  deleteExamples: async (): Promise<number> => 0,
  examplesDeleting: false,
  examplesDeletingError: null as Error | null,
});

const {
  mock: selectedContext,
  override: overrideSelectedContext,
  reset: resetSelectedContext,
} = createOverrideableMock({
  selectedExampleIds: [] as number[],
  updateSelectedExamples: (_exampleIds: number[]): void => undefined,
  addSelectedExample: (_exampleId: number): void => undefined,
  removeSelectedExample: (_exampleId: number): void => undefined,
  clearSelectedExamples: (): void => undefined,
});

const {
  mock: selectedExamplesState,
  override: overrideSelectedExamples,
  reset: resetSelectedExamples,
} = createOverrideableMock({
  selectedExamples: [] as ExampleWithVocabulary[],
  isFetchingExamples: 0,
});

const { mock: createTableApi, reset: resetCreateTable } =
  createOverrideableMock({
    useCreateTableState: (options: CreateTableOptions): CreateTableStateHook =>
      buildCreateTable(options),
  });

const { mock: validationApi, reset: resetValidation } = createOverrideableMock({
  useTableValidation: (options: ValidationOptions) => buildValidation(options),
});

vi.mock('@application/queries/ExampleQueries/useExampleMutations', () => ({
  useExampleMutations: () => exampleMutations,
}));

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: () => selectedContext,
}));

vi.mock(
  '@application/units/ExampleSearchInterface/useSelectedExamples',
  () => ({
    useSelectedExamples: () => selectedExamplesState,
  }),
);

vi.mock('@application/units/pasteTable/useCreateTableState', () => ({
  useCreateTableState: (options: CreateTableOptions) =>
    createTableApi.useCreateTableState(options),
}));

vi.mock('@application/units/pasteTable/hooks', async () => {
  const actual = (await vi.importActual(
    '@application/units/pasteTable/hooks',
  )) as Record<string, unknown>;
  return {
    ...actual,
    useTableValidation: (options: ValidationOptions) =>
      validationApi.useTableValidation(options),
  };
});

function renderCreator() {
  return renderHook(() => useExampleCreator(), {
    wrapper: MockAllProviders,
  });
}

async function save(onSave: (() => Promise<void>) | undefined): Promise<void> {
  await act(async () => {
    await onSave?.();
  });
}

describe('useExampleCreator', () => {
  beforeEach(() => {
    seededRows = [];
    latestCreateTable = undefined;
    latestCreateOptions = undefined;
    resetExampleMutations();
    resetSelectedContext();
    resetSelectedExamples();
    resetCreateTable();
    resetValidation();
  });

  it('wires table props to the paste-table unit and selected examples', () => {
    const examples = createMockExampleWithVocabularyList(2).map(
      (example, index) => ({ ...example, id: index + 1 }),
    );
    overrideSelectedExamples({
      selectedExamples: examples,
      isFetchingExamples: 2,
    });
    overrideExampleMutations({
      examplesCreating: true,
      examplesCreatingError: new Error('create failed'),
    });
    seededRows = [dataRow('row-1', 'hola', 'hello')];

    const { result } = renderCreator();
    const table = latestCreateTable;
    if (!table) {
      throw new Error('create table mock was not called');
    }

    expect(latestCreateOptions).toEqual({
      initialRows: [],
      columns: [
        { id: 'spanish', type: 'text' },
        { id: 'english', type: 'text' },
      ],
    });
    expect(result.current.tableProps.rows.map((row) => row.id)).toEqual([
      'row-1',
      GHOST_ROW_ID,
    ]);
    expect(result.current.tableProps.columns).toEqual(table.data.columns);
    expect(result.current.tableProps.hasData).toBe(true);
    expect(result.current.tableProps.isSaving).toBe(true);
    expect(result.current.tableProps.isValid).toBe(true);
    expect(result.current.tableProps.onCellChange).toBe(table.updateCell);
    expect(result.current.tableProps.onPaste).toBe(table.handlePaste);
    expect(result.current.tableProps.onReset).toBe(table.resetTable);
    expect(result.current.tableProps.activeCell).toEqual({
      rowId: 'focus-row',
      columnId: 'spanish',
    });
    expect(result.current.tableProps.setActiveCell).toBe(table.setActiveCell);
    expect(result.current.tableProps.setActiveCellInfo).toBe(
      table.setActiveCellInfo,
    );
    expect(result.current.tableProps.clearActiveCellInfo).toBe(
      table.clearActiveCellInfo,
    );
    expect(result.current.creationError?.message).toBe('create failed');
    expect(result.current.selectedExamples).toEqual(examples);
    expect(result.current.isFetchingExamples).toBe(true);
  });

  it('reports no rows to save and is not fetching when the count is zero', () => {
    overrideSelectedExamples({ isFetchingExamples: 0 });
    const { result } = renderCreator();

    expect(result.current.tableProps.hasData).toBe(false);
    expect(result.current.isFetchingExamples).toBe(false);
    expect(result.current.creationError).toBeNull();
  });

  it('rejects an empty spanish or english cell', () => {
    seededRows = [
      dataRow('missing-spanish', '   ', 'hello'),
      dataRow('missing-english', 'hola', ' '),
    ];
    const { result } = renderCreator();

    expect(result.current.tableProps.isValid).toBe(false);
    expect(
      result.current.tableProps.validationErrors['missing-spanish'].spanish,
    ).toBeDefined();
    expect(
      result.current.tableProps.validationErrors['missing-english'].english,
    ).toBeDefined();
    expect(
      result.current.tableProps.validationErrors[GHOST_ROW_ID],
    ).toBeUndefined();
  });

  it('rejects a duplicate spanish cell after trimming and keeps the uniqueness message', () => {
    seededRows = [
      dataRow('first', '  hola mundo  ', 'hello'),
      dataRow('second', 'hola mundo', 'hi'),
      dataRow('third', 'otra', 'other'),
    ];
    const { result } = renderCreator();

    expect(result.current.tableProps.isValid).toBe(false);
    expect(result.current.tableProps.validationErrors.first.spanish).toBe(
      'This spanish text is already in the table',
    );
    expect(result.current.tableProps.validationErrors.second.spanish).toBe(
      'This spanish text is already in the table',
    );
    expect(result.current.tableProps.validationErrors.third).toBeUndefined();
  });

  it('accepts one row when the only matching spanish text is on the ghost row', () => {
    seededRows = [
      dataRow('only', 'hola', 'hello'),
      { id: GHOST_ROW_ID, cells: { spanish: 'hola', english: '' } },
    ];
    const { result } = renderCreator();

    expect(result.current.tableProps.isValid).toBe(true);
    expect(result.current.tableProps.validationErrors).toEqual({});
  });

  it('does not treat different spanish text as a duplicate', () => {
    seededRows = [
      dataRow('first', 'Hola', 'hello'),
      dataRow('second', 'hola', 'hi'),
    ];
    const { result } = renderCreator();

    expect(result.current.tableProps.isValid).toBe(true);
  });

  it('does not create examples from an invalid row', async () => {
    seededRows = [
      dataRow('first', 'hola', 'hello'),
      dataRow('second', 'hola', 'hi'),
    ];
    const { result } = renderCreator();

    await save(result.current.tableProps.onSave);

    expect(exampleMutations.createExamples).not.toHaveBeenCalled();
    expect(selectedContext.updateSelectedExamples).not.toHaveBeenCalled();
    expect(latestCreateTable?.setRows).not.toHaveBeenCalled();
  });

  it('does not create examples when the table has no data rows', async () => {
    const { result } = renderCreator();

    expect(result.current.tableProps.isValid).toBe(true);
    await save(result.current.tableProps.onSave);

    expect(exampleMutations.createExamples).not.toHaveBeenCalled();
  });

  it('builds create commands from the trimmed spanish and english cells', async () => {
    seededRows = [
      dataRow('first', '  hola mundo  ', ' hello '),
      dataRow('second', 'gato', 'cat'),
    ];
    overrideSelectedContext({ selectedExampleIds: [3, 4] });
    const createExamples = vi.fn(async () => [
      createdExample(10, 'hola mundo'),
      createdExample(11, ' gato '),
    ]);
    overrideExampleMutations({ createExamples });
    const { result } = renderCreator();

    await save(result.current.tableProps.onSave);

    expect(createExamples).toHaveBeenCalledWith([
      { spanish: 'hola mundo', english: 'hello' },
      { spanish: 'gato', english: 'cat' },
    ]);
    expect(selectedContext.updateSelectedExamples).toHaveBeenCalledWith([
      3, 4, 10, 11,
    ]);
    expect(latestCreateTable?.setRows).toHaveBeenCalledWith([
      {
        id: GHOST_ROW_ID,
        cells: { spanish: '', english: '' },
      },
    ]);
  });

  it('keeps rows that were not created and leaves the ghost row last', async () => {
    seededRows = [
      dataRow('kept', 'perro', 'dog'),
      dataRow('removed', ' Hola ', 'hello'),
      { id: GHOST_ROW_ID, cells: { spanish: 'Hola', english: 'hello' } },
    ];
    overrideExampleMutations({
      createExamples: async () => [createdExample(8, 'Hola')],
    });
    const { result } = renderCreator();

    await save(result.current.tableProps.onSave);

    expect(latestCreateTable?.setRows).toHaveBeenCalledWith([
      dataRow('kept', 'perro', 'dog'),
      { id: GHOST_ROW_ID, cells: { spanish: 'Hola', english: 'hello' } },
    ]);
  });

  it('keeps every row when created spanish text differs by case', async () => {
    seededRows = [dataRow('kept', 'Hola', 'hello')];
    overrideExampleMutations({
      createExamples: async () => [createdExample(8, 'hola')],
    });
    const { result } = renderCreator();

    await save(result.current.tableProps.onSave);

    expect(latestCreateTable?.setRows).toHaveBeenCalledWith([
      dataRow('kept', 'Hola', 'hello'),
      ghostRow,
    ]);
  });

  it('does not update the selection when creating examples throws', async () => {
    seededRows = [dataRow('row-1', 'hola', 'hello')];
    overrideExampleMutations({
      createExamples: async () => {
        throw new Error('create failed');
      },
    });
    const { result } = renderCreator();

    await expect(
      act(async () => {
        await result.current.tableProps.onSave?.();
      }),
    ).rejects.toThrow('create failed');

    expect(selectedContext.updateSelectedExamples).not.toHaveBeenCalled();
    expect(latestCreateTable?.setRows).not.toHaveBeenCalled();
  });

  it('does not clear rows when updating the selection throws', async () => {
    seededRows = [dataRow('row-1', 'hola', 'hello')];
    overrideExampleMutations({
      createExamples: async () => [createdExample(10, 'hola')],
    });
    overrideSelectedContext({
      selectedExampleIds: [1],
      updateSelectedExamples: () => {
        throw new Error('selection failed');
      },
    });
    const { result } = renderCreator();

    await expect(
      act(async () => {
        await result.current.tableProps.onSave?.();
      }),
    ).rejects.toThrow('selection failed');

    expect(latestCreateTable?.setRows).not.toHaveBeenCalled();
  });
});
