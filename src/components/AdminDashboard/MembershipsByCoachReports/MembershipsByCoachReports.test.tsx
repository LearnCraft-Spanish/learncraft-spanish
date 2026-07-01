import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  createMockActiveMembershipSummary,
  createMockMembershipsByCoach,
} from '@testing/factories/adminReportsFactory';
import {
  mockUseMembershipsByCoachCurrentReport,
  overrideMockUseMembershipsByCoachCurrentReport,
  resetMockUseMembershipsByCoachCurrentReport,
} from 'src/hooks/AdminData/useMembershipsByCoachCurrentReport.mock';
import {
  mockUseMembershipsByCoachTwoWeeksOutReport,
  overrideMockUseMembershipsByCoachTwoWeeksOutReport,
  resetMockUseMembershipsByCoachTwoWeeksOutReport,
} from 'src/hooks/AdminData/useMembershipsByCoachTwoWeeksOutReport.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MembershipsByCoachCurrentReportDrilldownTable from './MembershipsByCoachCurrentReportDrilldownTable';
import MembershipsByCoachReports from './MembershipsByCoachReports';

vi.mock('src/hooks/AdminData/useMembershipsByCoachCurrentReport', () => ({
  default: () => mockUseMembershipsByCoachCurrentReport,
}));

vi.mock('src/hooks/AdminData/useMembershipsByCoachTwoWeeksOutReport', () => ({
  default: () => mockUseMembershipsByCoachTwoWeeksOutReport,
}));

function createCoachReport({
  coachId,
  coachName,
  studentName,
  courseName,
  weeklyPrivateCalls,
}: {
  coachId: number;
  coachName: string;
  studentName: string;
  courseName: string;
  weeklyPrivateCalls: number;
}): MembershipsByCoach {
  return createMockMembershipsByCoach({
    coach: {
      coach_id: coachId,
      fullName: coachName,
      email: `${coachName.toLowerCase().replaceAll(' ', '.')}@example.test`,
    },
    memberships: [
      createMockActiveMembershipSummary({
        studentName,
        courseName,
        courseWeeklyPrivateCalls: weeklyPrivateCalls,
        startDate: '2026-01-15T12:00:00.000Z',
        endDate: '2026-06-15T12:00:00.000Z',
      }),
    ],
    totalWeeklyPrivateCalls: weeklyPrivateCalls,
  });
}

function successfulQueryResult(
  data: MembershipsByCoach[],
): UseQueryResult<MembershipsByCoach[]> {
  return {
    data,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<MembershipsByCoach[]>;
}

describe('membershipsByCoachReports', () => {
  beforeEach(() => {
    resetMockUseMembershipsByCoachCurrentReport();
    resetMockUseMembershipsByCoachTwoWeeksOutReport();
  });

  it('opens the current report and renders the selected coach drilldown', () => {
    const currentReport = createCoachReport({
      coachId: 101,
      coachName: 'Coach Current',
      studentName: 'Current Student',
      courseName: 'Current Course',
      weeklyPrivateCalls: 2,
    });
    overrideMockUseMembershipsByCoachCurrentReport({
      membershipsByCoachCurrentReportQuery: successfulQueryResult([
        currentReport,
      ]),
    });

    render(<MembershipsByCoachReports />);

    fireEvent.click(screen.getByText('Active Memberships by Coach, Current'));

    expect(screen.getByText('Coach Current')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Coach Current'));

    expect(screen.getByText('Current Student')).toBeInTheDocument();
    expect(screen.getByText('Current Course')).toBeInTheDocument();
  });

  it('opens the two weeks out report and renders the selected coach drilldown', () => {
    const twoWeeksOutReport = createCoachReport({
      coachId: 202,
      coachName: 'Coach Future',
      studentName: 'Future Student',
      courseName: 'Future Course',
      weeklyPrivateCalls: 4,
    });
    overrideMockUseMembershipsByCoachTwoWeeksOutReport({
      membershipsByCoachTwoWeeksOutReportQuery: successfulQueryResult([
        twoWeeksOutReport,
      ]),
    });

    render(<MembershipsByCoachReports />);

    fireEvent.click(
      screen.getByText('Active Memberships by Coach - 2 Weeks Out'),
    );

    expect(screen.getByText('Coach Future')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Coach Future'));

    expect(screen.getByText('Future Student')).toBeInTheDocument();
    expect(screen.getByText('Future Course')).toBeInTheDocument();
  });

  it('shows the current report drilldown error state', () => {
    overrideMockUseMembershipsByCoachCurrentReport({
      membershipsByCoachCurrentReportQuery: {
        data: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        status: 'error',
      } as UseQueryResult<MembershipsByCoach[]>,
    });

    render(
      <MembershipsByCoachCurrentReportDrilldownTable selectedReport="101_Current" />,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
