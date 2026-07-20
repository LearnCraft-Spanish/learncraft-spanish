import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import {
  LOAD_MORE_SENTINEL,
  useAssignmentsCompletedByWeekReport,
} from '@application/units/useAssignmentsCompletedByWeekReport/useAssignmentsCompletedByWeekReport';
import { getDefaultAssignmentsReportWeekStarts } from '@domain/functions/assignmentsReportWeekStarts';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockAssignmentsCompletedByWeekList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it, vi } from 'vitest';

describe('useAssignmentsCompletedByWeekReport', () => {
  it('defaults weekStarts using the report business rule', () => {
    const { result } = renderHook(() => useAssignmentsCompletedByWeekReport(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.weekStarts).toBe(
      getDefaultAssignmentsReportWeekStarts(),
    );
    expect(result.current.weekOptions).toHaveLength(4);
  });

  it('fetches the report for the selected weekStarts', async () => {
    const mockData = createMockAssignmentsCompletedByWeekList(2);
    const getReport = vi.fn(async () => mockData);
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: getReport,
    });

    const { result } = renderHook(() => useAssignmentsCompletedByWeekReport(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.assignmentsCompletedByWeekQuery.isSuccess).toBe(
        true,
      ),
    );

    expect(getReport).toHaveBeenCalledWith(result.current.weekStarts);
    expect(result.current.assignmentsCompletedByWeekQuery.data).toEqual(
      [...mockData].sort((a, b) => a.courseName.localeCompare(b.courseName)),
    );
  });

  it('updates weekStarts when a week option is selected', async () => {
    const { result } = renderHook(() => useAssignmentsCompletedByWeekReport(), {
      wrapper: TestQueryClientProvider,
    });

    const nextWeek = result.current.weekOptions[1]?.weekStarts;
    expect(nextWeek).toBeDefined();

    act(() => {
      result.current.selectWeekStarts(nextWeek!);
    });

    expect(result.current.weekStarts).toBe(nextWeek);
  });

  it('loads more week options without changing the selected week', () => {
    const { result } = renderHook(() => useAssignmentsCompletedByWeekReport(), {
      wrapper: TestQueryClientProvider,
    });

    const selected = result.current.weekStarts;

    act(() => {
      result.current.selectWeekStarts(LOAD_MORE_SENTINEL);
    });

    expect(result.current.weekStarts).toBe(selected);
    expect(result.current.weekOptions).toHaveLength(8);
  });
});
