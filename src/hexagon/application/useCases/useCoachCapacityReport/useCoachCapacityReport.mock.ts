import type { UseCoachCapacityReportResult } from '@application/useCases/useCoachCapacityReport/useCoachCapacityReport';
import { DEFAULT_COACH_CAPACITY_SORT } from '@domain/functions/coachCapacity';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseCoachCapacityReportResult = {
  period: 'today',
  selectPeriod: () => {},
  tableProps: {
    rows: [],
    columns: [],
    dirtyRowIds: new Set(),
    validationErrors: {},
    onCellChange: () => {},
    hasUnsavedChanges: false,
    isLoading: false,
    isSaving: false,
    isValid: true,
    sort: DEFAULT_COACH_CAPACITY_SORT,
    onSortColumn: () => {},
  },
  isError: false,
  saveError: null,
  commitCell: () => {},
  onTableFocus: () => {},
  onTableBlur: () => {},
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
    isLoading: false,
    close: () => {},
  },
};

export const {
  mock: mockUseCoachCapacityReport,
  override: overrideMockUseCoachCapacityReport,
  reset: resetMockUseCoachCapacityReport,
} = createOverrideableMockHook<[], UseCoachCapacityReportResult>(
  defaultMockResult,
);

export default mockUseCoachCapacityReport;
