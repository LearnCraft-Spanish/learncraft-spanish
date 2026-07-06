import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useMembershipsBySalariedCoachTwoWeeksOutReportQuery } from '@application/queries/AdminReportQueries/useMembershipsBySalariedCoachTwoWeeksOutReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockMembershipsByCoachList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useMembershipsBySalariedCoachTwoWeeksOutReportQuery', () => {
  it('should fetch two weeks out memberships grouped by salaried coach', async () => {
    const mockData = createMockMembershipsByCoachList(2);
    overrideMockAdminReportsAdapter({
      getMembershipsBySalariedCoachTwoWeeksOutReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.isLoading,
    ).toBe(true);

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery
          .isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.isSuccess,
    ).toBe(true);
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.data,
    ).toEqual(
      [...mockData].sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      ),
    );
  });

  it('should return empty array when no salaried coaches have memberships', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsBySalariedCoachTwoWeeksOutReport: async () => [],
    });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery
          .isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.data,
    ).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsBySalariedCoachTwoWeeksOutReport: async () => {
        throw new Error(
          'Failed to fetch memberships by salaried coach two weeks out report',
        );
      },
    });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery
          .isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.isError,
    ).toBe(true);
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.data,
    ).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachTwoWeeksOutReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery
          .isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.status,
    ).toBe('pending');
    expect(
      result.current.membershipsBySalariedCoachTwoWeeksOutReportQuery.data,
    ).toBeUndefined();
  });
});
