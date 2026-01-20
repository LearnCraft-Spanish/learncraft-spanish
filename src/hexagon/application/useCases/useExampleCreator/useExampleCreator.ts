import type { CreateTableUseCaseProps } from '@application/useCases/types';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CreateExampleCommand,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useExampleMutations } from '@application/queries/ExampleQueries/useExampleMutations';
import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import { useCreateTableState } from '@application/units/pasteTable/useCreateTableState';
import {
  mapAndParseTableRowsToDomain,
  mapTableRowToDomain,
} from '@domain/PasteTable/functions';
import { validateEntity } from '@domain/PasteTable/functions/entityValidation';
import { createExampleCommandSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo } from 'react';

export interface UseExampleCreatorResult {
  tableProps: CreateTableUseCaseProps;
  creationError: Error | null;
  selectedExamples: ExampleWithVocabulary[];
  isFetchingExamples: boolean;
}

const exampleColumns: ColumnDefinition[] = [
  { id: 'spanish', type: 'text' },
  { id: 'english', type: 'text' },
];

export function useExampleCreator(): UseExampleCreatorResult {
  const { createExamples, examplesCreating, examplesCreatingError } =
    useExampleMutations();
  const { updateSelectedExamples, selectedExampleIds } =
    useSelectedExamplesContext();
  const { selectedExamples, isFetchingExamples: isFetching } =
    useSelectedExamples();
  const isFetchingExamples = isFetching > 0;

  // 1. Create table state (focused on state only - no mapping, no validation)
  const tableState = useCreateTableState({
    initialRows: [],
    columns: exampleColumns,
  });

  // 2. Compose validation: map → validate (normalization happens in mapper)
  const validateRow = useMemo(() => {
    return (row: TableRow) => {
      // 1. Map to domain entity (normalization happens internally)
      const domainEntity = mapTableRowToDomain<CreateExampleCommand>(
        row,
        exampleColumns,
      );

      // 2. Validate domain entity (typed validation)
      const result = validateEntity(domainEntity, createExampleCommandSchema);
      return result.errors;
    };
  }, []);

  // 3. Additional validation: ensure unique spanish text within table
  const validateUniqueSpanish = useMemo(() => {
    return (row: TableRow): Record<string, string> => {
      const spanishText = row.cells.spanish?.trim() || '';
      if (!spanishText) {
        return {}; // Empty is handled by schema validation
      }

      // Check if this spanish text appears in other rows
      const allRows = tableState.data.rows;
      const duplicates = allRows.filter(
        (r) =>
          r.id !== row.id && // Don't compare with self
          r.id !== GHOST_ROW_ID && // Don't compare with ghost row
          r.cells.spanish?.trim() === spanishText,
      );

      if (duplicates.length > 0) {
        return {
          spanish: 'This spanish text is already in the table',
        };
      }

      return {};
    };
  }, [tableState.data.rows]);

  // Combine domain validation with uniqueness validation
  const validateRowCombined = useMemo(() => {
    return (row: TableRow): Record<string, string> => {
      const domainErrors = validateRow(row);
      const uniqueErrors = validateUniqueSpanish(row);

      // Merge errors (uniqueness takes precedence if both exist)
      return { ...domainErrors, ...uniqueErrors };
    };
  }, [validateRow, validateUniqueSpanish]);

  // 4. Base validation (focused unit)
  const baseValidation = useTableValidation({
    rows: tableState.data.rows,
    validateRow: validateRowCombined,
  });

  // 5. Get data rows (excluding ghost row) - used by both save and tableProps
  const dataRows = useMemo(() => {
    return tableState.getRows().filter((row) => row.id !== GHOST_ROW_ID);
  }, [tableState]);

  const hasData = dataRows.length > 0;

  // 6. Handle save - get rows, map to domain, validate, then create
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

    // Create the examples batch (may be partial success)
    const createdExamples = await createExamples(domainEntities);

    // On successful save (partial or complete):
    // 1. Extract IDs from created examples
    const newExampleIds = createdExamples.map((example) => example.id);

    // 2. Add to selected examples (combine with existing selections)
    const updatedSelection = [...selectedExampleIds, ...newExampleIds];
    updateSelectedExamples(updatedSelection);

    // 3. Remove only the rows that were successfully created
    // Match by spanish text (unique identifier for examples)
    const createdSpanishTexts = new Set(
      createdExamples.map((example) => example.spanish.trim()),
    );

    // Filter out successful rows, keep failed ones
    const remainingRows = tableState.getRows().filter((row) => {
      if (row.id === GHOST_ROW_ID) return true; // Keep ghost row
      const spanishText = row.cells.spanish?.trim() || '';
      return !createdSpanishTexts.has(spanishText); // Keep if not created
    });

    // Update table state with remaining rows (and ghost row)
    const ghostRow = remainingRows.find((r) => r.id === GHOST_ROW_ID);
    const dataRowsRemaining = remainingRows.filter(
      (r) => r.id !== GHOST_ROW_ID,
    );
    tableState.setRows(
      ghostRow ? [...dataRowsRemaining, ghostRow] : dataRowsRemaining,
    );
  }, [
    baseValidation.validationState.isValid,
    dataRows,
    createExamples,
    selectedExampleIds,
    updateSelectedExamples,
    tableState,
  ]);

  // 7. Compose tableProps to satisfy CreateTableUseCaseProps contract
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
    selectedExamples,
    isFetchingExamples,
  };
}
