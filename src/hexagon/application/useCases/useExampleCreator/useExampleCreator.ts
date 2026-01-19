import type { CreateTableUseCaseProps } from '@application/useCases/types';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CreateExampleCommand } from '@learncraft-spanish/shared';
import { useExampleMutations } from '@application/queries/ExampleQueries/useExampleMutations';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import { useCreateTableState } from '@application/units/pasteTable/useCreateTableState';
import {
  mapAndParseTableRowsToDomain,
  mapTableRowToDomain,
  normalizeRowCells,
} from '@domain/PasteTable/functions';
import { validateEntity } from '@domain/PasteTable/functions/entityValidation';
import { createExampleCommandSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo } from 'react';

export interface UseExampleCreatorResult {
  tableProps: CreateTableUseCaseProps;
  creationError: Error | null;
}

const exampleColumns: ColumnDefinition[] = [
  { id: 'spanish', type: 'text' },
  { id: 'english', type: 'text' },
];

export function useExampleCreator(): UseExampleCreatorResult {
  const {createExamples , examplesCreating, examplesCreatingError} = useExampleMutations();

  // 1. Create table state (focused on state only - no mapping, no validation)
  const tableState = useCreateTableState({
    initialRows: [],
    columns: exampleColumns,
  });

  // 2. Compose validation: normalize → map → validate (domain-side)
  const validateRow = useMemo(() => {
    return (row: TableRow) => {
      // 1. Normalize strings
      const normalized = normalizeRowCells(row.cells, exampleColumns);

      // 2. Map to domain entity (typed)
      const domainEntity = mapTableRowToDomain<CreateExampleCommand>(
        { ...row, cells: normalized },
        exampleColumns,
      );

      // 3. Validate domain entity (typed validation)
      const result = validateEntity(domainEntity, createExampleCommandSchema);
      return result.errors;
    };
  }, []);

  // 3. Base validation (focused unit)
  const baseValidation = useTableValidation({
    rows: tableState.data.rows,
    validateRow,
  });

  // 4. Get data rows (excluding ghost row) - used by both save and tableProps
  const dataRows = useMemo(() => {
    return tableState.getRows().filter((row) => row.id !== GHOST_ROW_ID);
  }, [tableState]);

  const hasData = dataRows.length > 0;

  // 5. Handle save - get rows, map to domain, validate, then create
  const handleSave = useCallback(async () => {
    // Check validation before proceeding
    if (!baseValidation.validationState.isValid) {
      return;
    }

    if (dataRows.length === 0) {
      return;
    }

    // Map table → domain (with parsing/validation)
    const domainEntities = mapAndParseTableRowsToDomain<CreateExampleCommand>(
      dataRows,
      exampleColumns,
      createExampleCommandSchema,
      GHOST_ROW_ID,
    );

    // Create the examples batch
    await createExamples(domainEntities);

    // Reset table after successful creation
    tableState.resetTable();
  }, [baseValidation.validationState.isValid, dataRows, createExamples, tableState]);

  // 6. Compose tableProps to satisfy CreateTableUseCaseProps contract
  const tableProps = useMemo(() => {
    return {
      rows: tableState.data.rows,
      columns: tableState.data.columns,
      validationErrors: baseValidation.validationState.errors,
      isValid: baseValidation.validationState.isValid,
      isSaving: examplesCreating,
      hasData,
      onCellChange: tableState.updateCell,
      onPaste: tableState.handlePaste,
      onSave: handleSave,
      onReset: tableState.resetTable,
      activeCell: tableState.activeCell,
      setActiveCell: tableState.setActiveCell,
      setActiveCellInfo: tableState.setActiveCellInfo,
      clearActiveCellInfo: tableState.clearActiveCellInfo,
    };
  }, [
    tableState,
    baseValidation.validationState,
    examplesCreating,
    hasData,
    handleSave,
  ]);

  return {
    tableProps,
    creationError: examplesCreatingError,
  };
}