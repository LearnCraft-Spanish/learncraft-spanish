import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useMembershipsBySalariedCoachCurrentReportQuery } from '@application/queries/AdminReportQueries/useMembershipsBySalariedCoachCurrentReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockMembershipsByCoachList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useMembershipsBySalariedCoachCurrentReportQuery', () => {
  it('should fetch current memberships grouped by salaried coach', async () => {
    const mockData = createMockMembershipsByCoachList(2);
    overrideMockAdminReportsAdapter({
      getMembershipsBySalariedCoachCurrentReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.isLoading,
    ).toBe(true);

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.isSuccess,
    ).toBe(true);
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.data,
    ).toEqual(
      [...mockData].sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      ),
    );
  });

  it('should return empty array when no salaried coaches have memberships', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsBySalariedCoachCurrentReport: async () => [],
    });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.data,
    ).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsBySalariedCoachCurrentReport: async () => {
        throw new Error(
          'Failed to fetch memberships by salaried coach current report',
        );
      },
    });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.isError,
    ).toBe(true);
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.data,
    ).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useMembershipsBySalariedCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsBySalariedCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.status,
    ).toBe('pending');
    expect(
      result.current.membershipsBySalariedCoachCurrentReportQuery.data,
    ).toBeUndefined();
  });
});
