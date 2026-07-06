import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useMembershipsByCoachCurrentReportQuery } from '@application/queries/AdminReportQueries/useMembershipsByCoachCurrentReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockMembershipsByCoachList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useMembershipsByCoachCurrentReportQuery', () => {
  it('should fetch current memberships grouped by coach', async () => {
    const mockData = createMockMembershipsByCoachList(2);
    overrideMockAdminReportsAdapter({
      getMembershipsByCoachCurrentReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useMembershipsByCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(result.current.membershipsByCoachCurrentReportQuery.isLoading).toBe(
      true,
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.membershipsByCoachCurrentReportQuery.isSuccess).toBe(
      true,
    );
    expect(result.current.membershipsByCoachCurrentReportQuery.data).toEqual(
      [...mockData].sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      ),
    );
  });

  it('should return empty array when no coaches have memberships', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsByCoachCurrentReport: async () => [],
    });

    const { result } = renderHook(
      () => useMembershipsByCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.membershipsByCoachCurrentReportQuery.data).toEqual(
      [],
    );
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getMembershipsByCoachCurrentReport: async () => {
        throw new Error('Failed to fetch memberships by coach current report');
      },
    });

    const { result } = renderHook(
      () => useMembershipsByCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.membershipsByCoachCurrentReportQuery.isError).toBe(
      true,
    );
    expect(
      result.current.membershipsByCoachCurrentReportQuery.data,
    ).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useMembershipsByCoachCurrentReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.membershipsByCoachCurrentReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.membershipsByCoachCurrentReportQuery.status).toBe(
      'pending',
    );
    expect(
      result.current.membershipsByCoachCurrentReportQuery.data,
    ).toBeUndefined();
  });
});
