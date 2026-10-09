import type { EditableTableUseCaseProps } from '@application/useCases/types';
import type {
  CoachCapacityColumnId,
  CoachCapacityPeriod,
  CountedMembershipDisplayRow,
} from '@domain/functions/coachCapacity';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CoachCapacityReportRow,
  CoachCapacitySettings,
} from '@learncraft-spanish/shared';
import { useCoachCapacityReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import { useUpdateCoachCapacitySettingsMutation } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import { useEditTableState } from '@application/units/pasteTable';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import {
  applyCoachCapacitySettings,
  formatCoachCapacitySettingsCells,
  formatCoachCapacityTotalsCells,
  keepRowOrder,
  mapCoachCapacityRowToTableRow,
  mapCountedMembershipsToDisplayRows,
  parseCoachCapacitySettingsCells,
  resolveCoachCapacitySettingsCells,
  sortCoachCapacityRows,
} from '@domain/functions/coachCapacity';
import { useCallback, useMemo, useRef, useState } from 'react';

export interface CoachCapacityNotesPanelState {
  /** The coach whose notes are open, or null when the panel is closed */
  coachName: string | null;
  draft: string;
  setDraft: (notes: string) => void;
  close: () => void;
  save: () => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

export interface CoachCapacityDrilldownState {
  /** The coach whose counted memberships are shown, or null when closed */
  coachName: string | null;
  memberships: CountedMembershipDisplayRow[];
  /** True while the selected period is loading, so its memberships are not known yet */
  isLoading: boolean;
  close: () => void;
}

export interface UseCoachCapacityReportResult {
  /** The period shown, which starts on Today each time the report mounts */
  period: CoachCapacityPeriod;
  selectPeriod: (period: CoachCapacityPeriod) => void;
  tableProps: EditableTableUseCaseProps;
  isError: boolean;
  /** Names the coaches whose settings failed to save, if any did */
  saveError: string | null;
  /**
   * Call when the admin leaves a cell or presses Enter in it. Saves the
   * coach's settings if the cell was edited since it was last committed.
   */
  commitCell: (rowId: string, columnId: string) => void;
  /** Rows keep their order from when focus enters the table until it leaves */
  onTableFocus: () => void;
  onTableBlur: () => void;
  openNotes: (rowId: string) => void;
  notesPanel: CoachCapacityNotesPanelState;
  openDrilldown: (rowId: string) => void;
  drilldown: CoachCapacityDrilldownState;
}

const settingsInput = { type: 'number', min: 0, max: 40 } as const;

const coachCapacityColumns: (ColumnDefinition & {
  id: CoachCapacityColumnId;
})[] = [
  { id: 'coach', type: 'read-only', editable: false },
  { id: 'coachingHours', type: 'number', editable: false, derived: true },
  { id: 'groupSessionsPerWeek', ...settingsInput },
  { id: 'projectsHours', ...settingsInput },
  { id: 'internalTimeHours', ...settingsInput },
  { id: 'teamMeetingHours', ...settingsInput },
  { id: 'committedHours', type: 'number', editable: false, derived: true },
  { id: 'desiredHours', ...settingsInput },
  { id: 'bookedPercent', type: 'read-only', editable: false, derived: true },
  { id: 'notes', type: 'custom', editable: false },
];

const NOTES_SAVE_ERROR = 'Notes could not be saved. Try again.';

/**
 * A coach the notes panel or drilldown is open on. The name is kept so the
 * panel stays open while a newly selected period loads.
 */
interface OpenCoach {
  rowId: string;
  coachName: string;
}

function validateSettingsRow(row: TableRow): Record<string, string> {
  const result = parseCoachCapacitySettingsCells(row.cells, '');
  return result.success ? {} : result.errors;
}

function cellKey(rowId: string, columnId: string): string {
  return `${rowId}:${columnId}`;
}

export function useCoachCapacityReport(): UseCoachCapacityReportResult {
  const [period, setPeriod] = useState<CoachCapacityPeriod>('today');
  const { coachCapacityReportQuery } = useCoachCapacityReportQuery(period);
  const { updateCoachCapacitySettingsMutation } =
    useUpdateCoachCapacitySettingsMutation();
  const { data, isLoading, isError } = coachCapacityReportQuery;
  const { mutateAsync: updateSettings } = updateCoachCapacitySettingsMutation;

  const [pendingSaveCount, setPendingSaveCount] = useState(0);
  /** Coach names by row, for coaches whose latest save failed */
  const [failedSaves, setFailedSaves] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  /** The settings each edited row's totals were last worked out from */
  const [lastValidSettings, setLastValidSettings] = useState<
    ReadonlyMap<string, CoachCapacitySettings>
  >(() => new Map());
  const [heldRowOrder, setHeldRowOrder] = useState<string[] | null>(null);
  const uncommittedCells = useRef(new Set<string>());
  const [notesCoach, setNotesCoach] = useState<OpenCoach | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [drilldownCoach, setDrilldownCoach] = useState<OpenCoach | null>(null);

  const reportRowsById = useMemo(
    () => new Map((data ?? []).map((row) => [String(row.coach.coach_id), row])),
    [data],
  );
  const sourceRows = useMemo(
    () => (data ?? []).map(mapCoachCapacityRowToTableRow),
    [data],
  );

  /** The report row as the table shows it, each invalid cell at its last valid value */
  const toLiveReportRow = useCallback(
    (row: TableRow): CoachCapacityReportRow | undefined => {
      const reportRow = reportRowsById.get(row.id);
      if (!reportRow) return undefined;
      const settings = resolveCoachCapacitySettingsCells(
        row.cells,
        lastValidSettings.get(row.id) ?? reportRow.settings,
      );
      return applyCoachCapacitySettings(reportRow, settings);
    },
    [reportRowsById, lastValidSettings],
  );

  const computeDerivedFields = useCallback(
    (row: TableRow): Record<string, string> => {
      const liveRow = toLiveReportRow(row);
      return liveRow ? formatCoachCapacityTotalsCells(liveRow) : {};
    },
    [toLiveReportRow],
  );

  const editTableState = useEditTableState({
    sourceRows,
    columns: coachCapacityColumns,
    computeDerivedFields,
  });
  const editedRows = editTableState.data.rows;
  const editedRowsById = useMemo(
    () => new Map(editedRows.map((row) => [row.id, row])),
    [editedRows],
  );
  const { validationState } = useTableValidation({
    rows: editedRows,
    validateRow: validateSettingsRow,
  });

  const sortedRowIds = useMemo(
    () =>
      sortCoachCapacityRows(
        editedRows.flatMap((row) => toLiveReportRow(row) ?? []),
      ).map((row) => String(row.coach.coach_id)),
    [editedRows, toLiveReportRow],
  );
  const rowOrder = useMemo(
    () =>
      heldRowOrder ? keepRowOrder(sortedRowIds, heldRowOrder) : sortedRowIds,
    [heldRowOrder, sortedRowIds],
  );
  const rows = useMemo(
    () => rowOrder.flatMap((id) => editedRowsById.get(id) ?? []),
    [rowOrder, editedRowsById],
  );

  const onTableFocus = useCallback(
    () => setHeldRowOrder((held) => held ?? rowOrder),
    [rowOrder],
  );
  const onTableBlur = useCallback(() => setHeldRowOrder(null), []);

  const { updateCell } = editTableState;
  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateCell(rowId, columnId, value);
      uncommittedCells.current.add(cellKey(rowId, columnId));
      const row = editedRowsById.get(rowId);
      const liveRow = row && toLiveReportRow(row);
      if (!row || !liveRow) return;
      const settings = resolveCoachCapacitySettingsCells(
        { ...row.cells, [columnId]: value },
        liveRow.settings,
      );
      setLastValidSettings((previous) =>
        new Map(previous).set(rowId, settings),
      );
    },
    [updateCell, editedRowsById, toLiveReportRow],
  );

  const saveCoachSettings = useCallback(
    (
      rowId: string,
      coach: CoachCapacityReportRow['coach'],
      changes: Partial<CoachCapacitySettings>,
    ) => {
      setPendingSaveCount((count) => count + 1);
      updateSettings({ coachId: coach.coach_id, changes })
        .then(() =>
          setFailedSaves((previous) => {
            if (!previous.has(rowId)) return previous;
            const next = new Map(previous);
            next.delete(rowId);
            return next;
          }),
        )
        .catch(() =>
          setFailedSaves((previous) =>
            new Map(previous).set(rowId, coach.fullName),
          ),
        )
        .finally(() => setPendingSaveCount((count) => count - 1));
    },
    [updateSettings],
  );

  const { setRowsViaDiffs } = editTableState;
  const commitCell = useCallback(
    (rowId: string, columnId: string) => {
      if (!uncommittedCells.current.delete(cellKey(rowId, columnId))) return;
      const row = editedRowsById.get(rowId);
      const reportRow = reportRowsById.get(rowId);
      if (!row || !reportRow) return;
      const parsed = parseCoachCapacitySettingsCells(row.cells, '');
      if (!parsed.success) return;

      // Formatted like saved values, so each cell stops counting as edited
      // once the report holds what was saved
      const formattedCells = formatCoachCapacitySettingsCells(parsed.settings);
      setRowsViaDiffs(
        editedRows.map((editedRow) =>
          editedRow.id === rowId
            ? { ...editedRow, cells: { ...editedRow.cells, ...formattedCells } }
            : editedRow,
        ),
      );
      // Notes are left out so the save keeps the coach's saved notes
      const { notes: _notes, ...changes } = parsed.settings;
      saveCoachSettings(rowId, reportRow.coach, changes);
    },
    [
      editedRows,
      editedRowsById,
      reportRowsById,
      setRowsViaDiffs,
      saveCoachSettings,
    ],
  );

  const saveError = useMemo(
    () =>
      failedSaves.size === 0
        ? null
        : `Could not save settings for ${[...failedSaves.values()].join(', ')}. Your changes are still in the table.`,
    [failedSaves],
  );

  const notesRow =
    notesCoach === null ? undefined : reportRowsById.get(notesCoach.rowId);

  const openNotes = useCallback(
    (rowId: string) => {
      const reportRow = reportRowsById.get(rowId);
      if (!reportRow) return;
      setNotesCoach({ rowId, coachName: reportRow.coach.fullName });
      setNotesDraft(reportRow.settings.notes);
      setNotesError(null);
    },
    [reportRowsById],
  );

  const closeNotes = useCallback(() => {
    setNotesCoach(null);
    setNotesError(null);
  }, []);

  // Keeps the coach's saved settings, not any unsaved edits in their row
  const saveNotes = useCallback(async (): Promise<void> => {
    if (notesCoach === null) return;
    if (!notesRow) {
      setNotesError(NOTES_SAVE_ERROR);
      return;
    }
    setIsSavingNotes(true);
    setNotesError(null);
    try {
      await updateSettings({
        coachId: notesRow.coach.coach_id,
        changes: { notes: notesDraft },
      });
      setNotesCoach(null);
    } catch {
      setNotesError(NOTES_SAVE_ERROR);
    } finally {
      setIsSavingNotes(false);
    }
  }, [notesCoach, notesRow, notesDraft, updateSettings]);

  const drilldownRow =
    drilldownCoach === null
      ? undefined
      : reportRowsById.get(drilldownCoach.rowId);
  const drilldownMemberships = useMemo(
    () =>
      mapCountedMembershipsToDisplayRows(
        drilldownRow?.countedMemberships ?? [],
      ),
    [drilldownRow],
  );

  const openDrilldown = useCallback(
    (rowId: string) => {
      const reportRow = reportRowsById.get(rowId);
      if (reportRow) {
        setDrilldownCoach({ rowId, coachName: reportRow.coach.fullName });
      }
    },
    [reportRowsById],
  );

  const closeDrilldown = useCallback(() => setDrilldownCoach(null), []);

  const tableProps = useMemo<EditableTableUseCaseProps>(
    () => ({
      rows,
      columns: editTableState.data.columns,
      dirtyRowIds: editTableState.dirtyRowIds,
      validationErrors: validationState.errors,
      onCellChange: handleCellChange,
      setActiveCellInfo: editTableState.setActiveCellInfo,
      clearActiveCellInfo: editTableState.clearActiveCellInfo,
      hasUnsavedChanges: editTableState.hasUnsavedChanges,
      isSaving: pendingSaveCount > 0,
      isLoading,
      isValid: validationState.isValid,
    }),
    [
      rows,
      editTableState.data.columns,
      editTableState.dirtyRowIds,
      editTableState.setActiveCellInfo,
      editTableState.clearActiveCellInfo,
      editTableState.hasUnsavedChanges,
      validationState.errors,
      validationState.isValid,
      handleCellChange,
      pendingSaveCount,
      isLoading,
    ],
  );

  return {
    period,
    selectPeriod: setPeriod,
    tableProps,
    isError,
    saveError,
    commitCell,
    onTableFocus,
    onTableBlur,
    openNotes,
    notesPanel: {
      coachName: notesCoach?.coachName ?? null,
      draft: notesDraft,
      setDraft: setNotesDraft,
      close: closeNotes,
      save: saveNotes,
      isSaving: isSavingNotes,
      error: notesError,
    },
    openDrilldown,
    drilldown: {
      coachName: drilldownCoach?.coachName ?? null,
      memberships: drilldownMemberships,
      isLoading,
      close: closeDrilldown,
    },
  };
}
