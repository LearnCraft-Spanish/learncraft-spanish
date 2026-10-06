import type { UseCoachCapacityTodayReportResult } from '@application/useCases/useCoachCapacityTodayReport/useCoachCapacityTodayReport';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseCoachCapacityTodayReportResult = {
  tableProps: {
    rows: [],
    columns: [],
    dirtyRowIds: new Set(),
    validationErrors: {},
    onCellChange: () => {},
    onSave: async () => {},
    onDiscard: () => {},
    hasUnsavedChanges: false,
    isLoading: false,
    isSaving: false,
    isValid: true,
  },
  isError: false,
  saveError: null,
  openNotes: () => {},
  notesPanel: {
    coachName: null,
    draft: '',
    setDraft: () => {},
    close: () => {},
    save: async () => {},
    isSaving: false,
    error: null,
  },
};

export const {
  mock: mockUseCoachCapacityTodayReport,
  override: overrideMockUseCoachCapacityTodayReport,
  reset: resetMockUseCoachCapacityTodayReport,
} = createOverrideableMockHook<[], UseCoachCapacityTodayReportResult>(
  defaultMockResult,
);

export default mockUseCoachCapacityTodayReport;
