import type { EditableTableUseCaseProps } from '@application/useCases/types';
import type {
  CoachCapacityColumnId,
  CoachCapacityPeriod,
  CountedMembershipDisplayRow,
} from '@domain/functions/coachCapacity';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CoachCapacitySettings } from '@learncraft-spanish/shared';
import { useCoachCapacityReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import { useUpdateCoachCapacitySettingsMutation } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import { useEditTableState } from '@application/units/pasteTable';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import {
  mapCoachCapacityRowToTableRow,
  mapCountedMembershipsToDisplayRows,
  parseCoachCapacitySettingsCells,
  sortCoachCapacityRows,
} from '@domain/functions/coachCapacity';
import { useCallback, useMemo, useState } from 'react';

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

export function useCoachCapacityReport(): UseCoachCapacityReportResult {
  const [period, setPeriod] = useState<CoachCapacityPeriod>('today');
  const { coachCapacityReportQuery } = useCoachCapacityReportQuery(period);
  const { updateCoachCapacitySettingsMutation } =
    useUpdateCoachCapacitySettingsMutation();
  const { data, isLoading, isError } = coachCapacityReportQuery;
  const { mutateAsync: updateSettings } = updateCoachCapacitySettingsMutation;

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notesCoach, setNotesCoach] = useState<OpenCoach | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [drilldownCoach, setDrilldownCoach] = useState<OpenCoach | null>(null);

  const reportRows = useMemo(() => sortCoachCapacityRows(data ?? []), [data]);
  const reportRowsById = useMemo(
    () => new Map(reportRows.map((row) => [String(row.coach.coach_id), row])),
    [reportRows],
  );
  const sourceRows = useMemo(
    () => reportRows.map(mapCoachCapacityRowToTableRow),
    [reportRows],
  );

  const editTableState = useEditTableState({
    sourceRows,
    columns: coachCapacityColumns,
  });
  const { validationState } = useTableValidation({
    rows: editTableState.data.rows,
    validateRow: validateSettingsRow,
  });

  const saveSettings = useCallback(
    (rowId: string, settings: CoachCapacitySettings) => {
      const reportRow = reportRowsById.get(rowId);
      if (!reportRow) {
        return Promise.reject(new Error(`Coach ${rowId} is not in the report`));
      }
      return updateSettings({ coachId: reportRow.coach.coach_id, settings });
    },
    [reportRowsById, updateSettings],
  );

  const saveEditedRow = useCallback(
    (row: TableRow) => {
      const notes = reportRowsById.get(row.id)?.settings.notes ?? '';
      const parsed = parseCoachCapacitySettingsCells(row.cells, notes);
      if (!parsed.success) {
        return Promise.reject(new Error('Settings are not valid'));
      }
      return saveSettings(row.id, parsed.settings);
    },
    [reportRowsById, saveSettings],
  );

  const { getDirtyRows, setRowsViaDiffs } = editTableState;
  const handleSave = useCallback(async (): Promise<void> => {
    const dirtyRows = getDirtyRows();
    setIsSaving(true);
    setSaveError(null);

    const results = await Promise.allSettled(dirtyRows.map(saveEditedRow));
    const failedRows = dirtyRows.filter(
      (_, index) => results[index].status === 'rejected',
    );

    // Saved rows drop their edits; failed rows keep them for another try
    setRowsViaDiffs(failedRows);
    if (failedRows.length > 0) {
      const coachNames = failedRows.map((row) => row.cells.coach).join(', ');
      setSaveError(
        `Could not save settings for ${coachNames}. Your changes are still in the table.`,
      );
    }
    setIsSaving(false);
  }, [getDirtyRows, setRowsViaDiffs, saveEditedRow]);

  const { discardChanges } = editTableState;
  const handleDiscard = useCallback(() => {
    discardChanges();
    setSaveError(null);
  }, [discardChanges]);

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

  // Sends the coach's saved settings, not any unsaved edits in their row
  const saveNotes = useCallback(async (): Promise<void> => {
    if (notesCoach === null) return;
    if (!notesRow) {
      setNotesError(NOTES_SAVE_ERROR);
      return;
    }
    setIsSavingNotes(true);
    setNotesError(null);
    try {
      await saveSettings(notesCoach.rowId, {
        ...notesRow.settings,
        notes: notesDraft,
      });
      setNotesCoach(null);
    } catch {
      setNotesError(NOTES_SAVE_ERROR);
    } finally {
      setIsSavingNotes(false);
    }
  }, [notesCoach, notesRow, notesDraft, saveSettings]);

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
      rows: editTableState.data.rows,
      columns: editTableState.data.columns,
      dirtyRowIds: editTableState.dirtyRowIds,
      validationErrors: validationState.errors,
      onCellChange: editTableState.updateCell,
      setActiveCellInfo: editTableState.setActiveCellInfo,
      clearActiveCellInfo: editTableState.clearActiveCellInfo,
      hasUnsavedChanges: editTableState.hasUnsavedChanges,
      onSave: handleSave,
      onDiscard: handleDiscard,
      isSaving,
      isLoading,
      isValid: validationState.isValid,
    }),
    [
      editTableState.data.rows,
      editTableState.data.columns,
      editTableState.dirtyRowIds,
      editTableState.updateCell,
      editTableState.setActiveCellInfo,
      editTableState.clearActiveCellInfo,
      editTableState.hasUnsavedChanges,
      validationState.errors,
      validationState.isValid,
      handleSave,
      handleDiscard,
      isSaving,
      isLoading,
    ],
  );

  return {
    period,
    selectPeriod: setPeriod,
    tableProps,
    isError,
    saveError,
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
