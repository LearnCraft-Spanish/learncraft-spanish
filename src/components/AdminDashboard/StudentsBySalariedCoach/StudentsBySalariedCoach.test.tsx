import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  createMockActiveMembershipSummary,
  createMockMembershipsByCoach,
} from '@testing/factories/adminReportsFactory';
import {
  mockUseMembershipsBySalariedCoachCurrentReport,
  overrideMockUseMembershipsBySalariedCoachCurrentReport,
  resetMockUseMembershipsBySalariedCoachCurrentReport,
} from 'src/hooks/AdminData/useMembershipsBySalariedCoachCurrentReport.mock';
import {
  mockUseMembershipsBySalariedCoachTwoWeeksOutReport,
  overrideMockUseMembershipsBySalariedCoachTwoWeeksOutReport,
  resetMockUseMembershipsBySalariedCoachTwoWeeksOutReport,
} from 'src/hooks/AdminData/useMembershipsBySalariedCoachTwoWeeksOutReport.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CurrentStudentsDrilldownTable from './CurrentStudentsDrilldownTable';
import StudentsBySalariedCoach from './StudentsBySalariedCoach';

vi.mock(
  'src/hooks/AdminData/useMembershipsBySalariedCoachCurrentReport',
  () => ({
    default: () => mockUseMembershipsBySalariedCoachCurrentReport,
  }),
);

vi.mock(
  'src/hooks/AdminData/useMembershipsBySalariedCoachTwoWeeksOutReport',
  () => ({
    default: () => mockUseMembershipsBySalariedCoachTwoWeeksOutReport,
  }),
);

function createSalariedCoachReport({
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

describe('studentsBySalariedCoach', () => {
  beforeEach(() => {
    resetMockUseMembershipsBySalariedCoachCurrentReport();
    resetMockUseMembershipsBySalariedCoachTwoWeeksOutReport();
  });

  it('opens the current report and renders the selected salaried coach drilldown', () => {
    const currentReport = createSalariedCoachReport({
      coachId: 301,
      coachName: 'Salaried Current Coach',
      studentName: 'Current Salaried Student',
      courseName: 'Current Salaried Course',
      weeklyPrivateCalls: 3,
    });
    overrideMockUseMembershipsBySalariedCoachCurrentReport({
      membershipsBySalariedCoachCurrentReportQuery: successfulQueryResult([
        currentReport,
      ]),
    });

    render(<StudentsBySalariedCoach />);

    fireEvent.click(screen.getByText('Current Students by Salaried Coach'));

    expect(screen.getByText('Salaried Current Coach')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Salaried Current Coach'));

    expect(screen.getByText('Current Salaried Student')).toBeInTheDocument();
    expect(screen.getByText('Current Salaried Course')).toBeInTheDocument();
  });

  it('opens the two weeks out report and renders the selected salaried coach drilldown', () => {
    const twoWeeksOutReport = createSalariedCoachReport({
      coachId: 402,
      coachName: 'Salaried Future Coach',
      studentName: 'Future Salaried Student',
      courseName: 'Future Salaried Course',
      weeklyPrivateCalls: 5,
    });
    overrideMockUseMembershipsBySalariedCoachTwoWeeksOutReport({
      membershipsBySalariedCoachTwoWeeksOutReportQuery: successfulQueryResult([
        twoWeeksOutReport,
      ]),
    });

    render(<StudentsBySalariedCoach />);

    fireEvent.click(
      screen.getByText('Students by Salaried Coach - 2 Weeks Out'),
    );

    expect(screen.getByText('Salaried Future Coach')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Salaried Future Coach'));

    expect(screen.getByText('Future Salaried Student')).toBeInTheDocument();
    expect(screen.getByText('Future Salaried Course')).toBeInTheDocument();
  });

  it('shows the current report drilldown error state', () => {
    overrideMockUseMembershipsBySalariedCoachCurrentReport({
      membershipsBySalariedCoachCurrentReportQuery: {
        data: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        status: 'error',
      } as UseQueryResult<MembershipsByCoach[]>,
    });

    render(
      <CurrentStudentsDrilldownTable selectedReport="301_Current Students" />,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
