import type { UseCoachCapacityReportResult } from '@application/useCases/useCoachCapacityReport/useCoachCapacityReport';
import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseCoachCapacityReportResult = {
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
  openDrilldown: () => {},
  drilldown: {
    coachName: null,
    memberships: [],
    close: () => {},
  },
};

export const {
  mock: mockUseCoachCapacityReport,
  override: overrideMockUseCoachCapacityReport,
  reset: resetMockUseCoachCapacityReport,
} = createOverrideableMockHook<
  [CoachCapacityPeriod],
  UseCoachCapacityReportResult
>(defaultMockResult);

export default mockUseCoachCapacityReport;
