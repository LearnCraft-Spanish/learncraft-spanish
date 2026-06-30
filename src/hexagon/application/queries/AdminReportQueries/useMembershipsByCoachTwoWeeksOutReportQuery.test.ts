import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useMembershipsByCoachTwoWeeksOutReportQuery } from '@application/queries/AdminReportQueries/useMembershipsByCoachTwoWeeksOutReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockMembershipsByCoachList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useMembershipsByCoachTwoWeeksOutReportQuery', () => {
  it('should fetch two weeks out memberships grouped by coach', async () => {
    const mockData = createMockMembershipsByCoachList(2);
    overrideMockAdminReportsAdapter({
      getMembershipsByCoachTwoWeeksOutReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useMembershipsByCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.isLoading,
    ).toBe(true);

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachTwoWeeksOutReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.isSuccess,
    ).toBe(true);
    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.data,
    ).toEqual(
      [...mockData].sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      ),
    );
  });

  it('should return empty array when no coaches have memberships', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsByCoachTwoWeeksOutReport: async () => [],
    });

    const { result } = renderHook(
      () => useMembershipsByCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachTwoWeeksOutReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.data,
    ).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsByCoachTwoWeeksOutReport: async () => {
        throw new Error(
          'Failed to fetch memberships by coach two weeks out report',
        );
      },
    });

    const { result } = renderHook(
      () => useMembershipsByCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachTwoWeeksOutReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.isError,
    ).toBe(true);
    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.data,
    ).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useMembershipsByCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachTwoWeeksOutReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.membershipsByCoachTwoWeeksOutReportQuery.status).toBe(
      'pending',
    );
    expect(
      result.current.membershipsByCoachTwoWeeksOutReportQuery.data,
    ).toBeUndefined();
  });
});
