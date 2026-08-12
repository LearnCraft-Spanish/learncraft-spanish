import type { WeeklyTimeCommitmentByCoach as WeeklyTimeCommitmentByCoachData } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockWeeklyTimeCommitmentByCoach } from '@testing/factories/adminReportsFactory';
import {
  mockUseWeeklyTimeCommitmentByCoach,
  overrideMockUseWeeklyTimeCommitmentByCoach,
  resetMockUseWeeklyTimeCommitmentByCoach,
} from 'src/hooks/AdminData/useWeeklyTimeCommitmentByCoach.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WeeklyTimeCommitmentByCoach from './WeeklyTimeCommitmentByCoach';

vi.mock('src/hooks/AdminData/useWeeklyTimeCommitmentByCoach', () => ({
  default: () => mockUseWeeklyTimeCommitmentByCoach,
}));

function successfulQueryResult(
  data: WeeklyTimeCommitmentByCoachData[],
): UseQueryResult<WeeklyTimeCommitmentByCoachData[]> {
  return {
    data,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<WeeklyTimeCommitmentByCoachData[]>;
}

describe('weeklyTimeCommitmentByCoach', () => {
  beforeEach(() => {
    resetMockUseWeeklyTimeCommitmentByCoach();
  });

  it('is collapsed by default and does not render the table', () => {
    render(<WeeklyTimeCommitmentByCoach />);

    expect(
      screen.getByText('Weekly Time Commitment by Coach'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Coach')).not.toBeInTheDocument();
  });

  it('renders each coach with their time commitment formatted in hours', () => {
    const coachReport = createMockWeeklyTimeCommitmentByCoach({
      coach: {
        coach_id: 501,
        fullName: 'Coach Weekly',
        email: 'coach.weekly@example.test',
      },
      totalWeeklyTimeCommitmentMinutes: 90,
    });
    overrideMockUseWeeklyTimeCommitmentByCoach({
      weeklyTimeCommitmentByCoachReportQuery: successfulQueryResult([
        coachReport,
      ]),
    });

    render(<WeeklyTimeCommitmentByCoach />);

    fireEvent.click(screen.getByText('Weekly Time Commitment by Coach'));

    expect(screen.getByText('Coach Weekly')).toBeInTheDocument();
    expect(screen.getByText('1.5 hrs')).toBeInTheDocument();
  });

  it('shows no records when there are no coaches with a time commitment', () => {
    overrideMockUseWeeklyTimeCommitmentByCoach({
      weeklyTimeCommitmentByCoachReportQuery: successfulQueryResult([]),
    });

    render(<WeeklyTimeCommitmentByCoach />);

    fireEvent.click(screen.getByText('Weekly Time Commitment by Coach'));

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('renders an empty table when the report query errors', () => {
    overrideMockUseWeeklyTimeCommitmentByCoach({
      weeklyTimeCommitmentByCoachReportQuery: {
        data: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        status: 'error',
      } as UseQueryResult<WeeklyTimeCommitmentByCoachData[]>,
    });

    render(<WeeklyTimeCommitmentByCoach />);

    fireEvent.click(screen.getByText('Weekly Time Commitment by Coach'));

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });
});
