import type { LeadsToReEngage as LeadsToReEngageData } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockLeadsToReEngage } from '@testing/factories/adminReportsFactory';
import {
  mockUseLeadsToReEngage,
  overrideMockUseLeadsToReEngage,
  resetMockUseLeadsToReEngage,
} from 'src/hooks/AdminData/useLeadsToReEngage.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LeadsToReEngage from './LeadsToReEngage';

vi.mock('src/hooks/AdminData/useLeadsToReEngage', () => ({
  default: () => mockUseLeadsToReEngage,
}));

function successfulQueryResult(
  data: LeadsToReEngageData[],
): UseQueryResult<LeadsToReEngageData[]> {
  return {
    data,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<LeadsToReEngageData[]>;
}

const coachOne = createMockLeadsToReEngage({
  coach: {
    coach_id: 501,
    fullName: 'Coach Reengage',
    email: 'coach.reengage@example.test',
  },
  students: [
    {
      student_id: 1,
      fullName: 'Student One',
      email: 'student.one@example.test',
      lastMembershipName: 'Coaching Program',
      lastMembershipEndDate: '2026-01-01',
      onHold: false,
    },
  ],
});

const coachTwo = createMockLeadsToReEngage({
  coach: {
    coach_id: 502,
    fullName: 'Coach Second',
    email: 'coach.second@example.test',
  },
  students: [
    {
      student_id: 2,
      fullName: 'Student Two',
      email: 'student.two@example.test',
      lastMembershipName: 'Coaching Program',
      lastMembershipEndDate: '2026-02-01',
      onHold: false,
    },
  ],
});

describe('leadsToReEngage', () => {
  beforeEach(() => {
    resetMockUseLeadsToReEngage();
  });

  it('is collapsed by default and does not render any coach sections', () => {
    render(<LeadsToReEngage />);

    expect(screen.getByText('Leads to Re-engage')).toBeInTheDocument();
    expect(screen.queryByText('Coach Reengage')).not.toBeInTheDocument();
  });

  it('renders each coach collapsed by default, without their students, once the report is opened', () => {
    overrideMockUseLeadsToReEngage({
      leadsToReEngageReportQuery: successfulQueryResult([coachOne, coachTwo]),
    });

    render(<LeadsToReEngage />);

    fireEvent.click(screen.getByText('Leads to Re-engage'));

    expect(screen.getByText('Coach Reengage')).toBeInTheDocument();
    expect(screen.getByText('Coach Second')).toBeInTheDocument();
    expect(screen.queryByText('Student One')).not.toBeInTheDocument();
    expect(screen.queryByText('Student Two')).not.toBeInTheDocument();
  });

  it('opens and closes each coach section independently', () => {
    overrideMockUseLeadsToReEngage({
      leadsToReEngageReportQuery: successfulQueryResult([coachOne, coachTwo]),
    });

    render(<LeadsToReEngage />);

    fireEvent.click(screen.getByText('Leads to Re-engage'));
    fireEvent.click(screen.getByText('Coach Reengage'));

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.queryByText('Student Two')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Coach Second'));

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.getByText('Student Two')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Coach Reengage'));

    expect(screen.queryByText('Student One')).not.toBeInTheDocument();
    expect(screen.getByText('Student Two')).toBeInTheDocument();
  });

  it('expands and collapses all coach sections via the top-level toggle button', () => {
    overrideMockUseLeadsToReEngage({
      leadsToReEngageReportQuery: successfulQueryResult([coachOne, coachTwo]),
    });

    render(<LeadsToReEngage />);

    fireEvent.click(screen.getByText('Leads to Re-engage'));

    const toggleAllButton = screen.getByText('Expand All');
    fireEvent.click(toggleAllButton);

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.getByText('Student Two')).toBeInTheDocument();
    expect(screen.getByText('Collapse All')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Collapse All'));

    expect(screen.queryByText('Student One')).not.toBeInTheDocument();
    expect(screen.queryByText('Student Two')).not.toBeInTheDocument();
    expect(screen.getByText('Expand All')).toBeInTheDocument();
  });

  it('disables the toggle-all button when there are no coaches', () => {
    overrideMockUseLeadsToReEngage({
      leadsToReEngageReportQuery: successfulQueryResult([]),
    });

    render(<LeadsToReEngage />);

    fireEvent.click(screen.getByText('Leads to Re-engage'));

    expect(screen.getByText('Expand All')).toBeDisabled();
  });

  it('shows no records when there are no leads to re-engage', () => {
    overrideMockUseLeadsToReEngage({
      leadsToReEngageReportQuery: successfulQueryResult([]),
    });

    render(<LeadsToReEngage />);

    fireEvent.click(screen.getByText('Leads to Re-engage'));

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('shows no records when the report query errors', () => {
    overrideMockUseLeadsToReEngage({
      leadsToReEngageReportQuery: {
        data: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        status: 'error',
      } as UseQueryResult<LeadsToReEngageData[]>,
    });

    render(<LeadsToReEngage />);

    fireEvent.click(screen.getByText('Leads to Re-engage'));

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });
});
