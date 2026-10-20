import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLapsedLongTermCoachingStudentsReportQuery } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';
import {
  mockUseLapsedLongTermCoachingStudentsReportQuery,
  overrideMockUseLapsedLongTermCoachingStudentsReportQuery,
  resetMockUseLapsedLongTermCoachingStudentsReportQuery,
} from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery.mock';
import { LAPSED_STUDENT_ALL } from '@domain/functions/lapsedLongTermCoachingStudents';
import { LapsedLongTermCoachingStudentsReport } from '@interface/components/LapsedLongTermCoachingStudents';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery',
  () => ({
    useLapsedLongTermCoachingStudentsReportQuery: vi.fn(
      () => mockUseLapsedLongTermCoachingStudentsReportQuery,
    ),
  }),
);

const TITLE = 'Lapsed Long-Term Coaching Students';

function successfulQueryResult(
  data: LapsedLongTermCoachingStudent[],
): UseQueryResult<LapsedLongTermCoachingStudent[]> {
  return {
    data,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<LapsedLongTermCoachingStudent[]>;
}

const ada: LapsedLongTermCoachingStudent = {
  student_id: 11,
  fullName: 'Ada Lopez',
  email: 'ada@example.test',
  previousPrimaryCoach: 'Coach Rivera',
  previousMemberships: [
    {
      courseName: 'Premier Coaching',
      startDate: '2024-01-15',
      endDate: '2024-10-01',
    },
    {
      courseName: 'Regular Coaching',
      startDate: '2023-03-01',
      endDate: '',
    },
  ],
};

const noCoach: LapsedLongTermCoachingStudent = {
  student_id: 12,
  fullName: 'Bea Chen',
  email: 'bea@example.test',
  previousPrimaryCoach: '',
  previousMemberships: [
    {
      courseName: 'Group Coaching',
      startDate: '',
      endDate: '',
    },
  ],
};

function students(count: number): LapsedLongTermCoachingStudent[] {
  return Array.from({ length: count }, (_, index) => ({
    student_id: index + 1,
    fullName: `Student ${String(index + 1).padStart(2, '0')}`,
    email: `student${index + 1}@example.test`,
    previousPrimaryCoach: 'Coach Rivera',
    previousMemberships: [
      {
        courseName: 'Premier Coaching',
        startDate: '2024-01-15',
        endDate: '2024-10-01',
      },
    ],
  }));
}

describe('lapsed long-term coaching students report', () => {
  beforeEach(() => {
    resetMockUseLapsedLongTermCoachingStudentsReportQuery();
    vi.mocked(useLapsedLongTermCoachingStudentsReportQuery).mockClear();
  });

  it('stays collapsed and does not fetch until it is opened', () => {
    render(<LapsedLongTermCoachingStudentsReport />);

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(useLapsedLongTermCoachingStudentsReportQuery).not.toHaveBeenCalled();
  });

  it('lists each student with their coach and previous memberships, newest first', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: successfulQueryResult([ada]),
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    const row = screen.getByText('Ada Lopez').closest('tr');
    expect(row).toHaveTextContent('ada@example.test');
    expect(row).toHaveTextContent('Coach Rivera');
    expect(row).toHaveTextContent('Premier Coaching');
    expect(row).toHaveTextContent('1/15/2024 – 10/1/2024');
    expect(row).toHaveTextContent('Regular Coaching');
    expect(row).toHaveTextContent('3/1/2023');
    expect(row?.textContent?.indexOf('Premier Coaching')).toBeLessThan(
      row?.textContent?.indexOf('Regular Coaching') ?? -1,
    );
    expect(screen.getByText('1 student')).toBeInTheDocument();
  });

  it('shows a dash when no previous coach was recorded, and the course alone when dates are blank', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: successfulQueryResult([
        noCoach,
      ]),
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    const row = screen.getByText('Bea Chen').closest('tr');
    expect(row).toHaveTextContent('—');
    expect(row).toHaveTextContent('Group Coaching');
    expect(row).not.toHaveTextContent('–');
  });

  it('shows no records when nobody qualifies', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: successfulQueryResult([]),
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    expect(screen.getByText('No records found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows a loading message while the report is fetching', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: {
        data: undefined,
        isLoading: true,
        isError: false,
        isSuccess: false,
        status: 'pending',
      } as UseQueryResult<LapsedLongTermCoachingStudent[]>,
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    expect(screen.getByText('Loading lapsed students...')).toBeInTheDocument();
  });

  it('shows an error when the report fails to load', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: {
        data: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        status: 'error',
      } as UseQueryResult<LapsedLongTermCoachingStudent[]>,
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    expect(screen.getByText('Could not load this report.')).toBeInTheDocument();
  });

  it('pages the list 20 students at a time', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: successfulQueryResult(
        students(21),
      ),
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    expect(screen.getByText('21 students')).toBeInTheDocument();
    expect(screen.getByText('Student 01')).toBeInTheDocument();
    expect(screen.queryByText('Student 21')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next/ }));

    expect(screen.getByText('Student 21')).toBeInTheDocument();
    expect(screen.queryByText('Student 01')).not.toBeInTheDocument();
  });

  it('filters by coach and by membership type, and sorts by either', () => {
    const amy: LapsedLongTermCoachingStudent = {
      student_id: 2,
      fullName: 'Amy',
      email: 'amy@example.test',
      previousPrimaryCoach: 'Zed Coach',
      previousMemberships: [
        {
          courseName: 'Regular Coaching',
          startDate: '2024-08-01',
          endDate: '2024-06-15',
        },
        {
          courseName: 'Premier Coaching',
          startDate: '2023-01-01',
          endDate: '2024-10-01',
        },
      ],
    };
    const zoe: LapsedLongTermCoachingStudent = {
      student_id: 9,
      fullName: 'Zoe',
      email: 'zoe@example.test',
      previousPrimaryCoach: 'Ann Coach',
      previousMemberships: [
        {
          courseName: 'Premier Coaching',
          startDate: '2022-01-01',
          endDate: '2023-01-01',
        },
      ],
    };
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: successfulQueryResult([
        zoe,
        amy,
      ]),
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));

    const names = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.textContent);
    expect(names()[0]).toContain('Amy');
    expect(names()[1]).toContain('Zoe');
    expect(screen.getByText('Amy').closest('tr')).toHaveTextContent(
      'Premier Coaching',
    );

    fireEvent.change(screen.getByLabelText('Coach'), {
      target: { value: 'Ann Coach' },
    });
    expect(screen.getByText('Zoe')).toBeInTheDocument();
    expect(screen.queryByText('Amy')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 2 students')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Coach'), {
      target: { value: LAPSED_STUDENT_ALL },
    });
    const typeSearch = screen.getByLabelText('Membership types');
    fireEvent.focus(typeSearch);
    fireEvent.click(screen.getByRole('option', { name: 'Regular Coaching' }));
    expect(screen.getByText('Amy')).toBeInTheDocument();
    expect(screen.queryByText('Zoe')).not.toBeInTheDocument();
    expect(screen.getByText('Amy').closest('tr')).toHaveTextContent(
      'Premier Coaching',
    );
    expect(screen.getByText('Amy').closest('tr')).toHaveTextContent(
      'Regular Coaching',
    );
    expect(
      screen.getByRole('group', { name: 'Selected membership types' }),
    ).toHaveTextContent('Regular Coaching');

    fireEvent.change(typeSearch, { target: { value: 'prem' } });
    fireEvent.keyDown(typeSearch, { key: 'Enter' });
    expect(screen.getByText('Amy')).toBeInTheDocument();
    expect(screen.getByText('Zoe')).toBeInTheDocument();
    expect(screen.getByText('Amy').closest('tr')).toHaveTextContent(
      'Premier Coaching',
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Regular Coaching' }),
    );
    expect(screen.getByText('Zoe')).toBeInTheDocument();
    expect(screen.getByText('Amy').closest('tr')).toHaveTextContent(
      'Regular Coaching',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(
      screen.queryByRole('group', { name: 'Selected membership types' }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Sort by'), {
      target: { value: 'coach' },
    });
    expect(names()[0]).toContain('Zoe');
    expect(names()[1]).toContain('Amy');

    fireEvent.click(screen.getByRole('button', { name: 'A to Z' }));
    expect(names()[0]).toContain('Amy');
    expect(names()[1]).toContain('Zoe');
  });

  it('searches students by name or email, ignoring case', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: successfulQueryResult([
        ada,
        noCoach,
      ]),
    });

    render(<LapsedLongTermCoachingStudentsReport />);
    fireEvent.click(screen.getByText(TITLE));
    const search = screen.getByLabelText('Search students');

    fireEvent.change(search, { target: { value: 'ADA' } });
    expect(screen.getByText('Ada Lopez')).toBeInTheDocument();
    expect(screen.queryByText('Bea Chen')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 2 students')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'Bea@Example' } });
    expect(screen.getByText('Bea Chen')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lopez')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Clear student search' }),
    );
    expect(search).toHaveValue('');
    expect(screen.getByText('2 students')).toBeInTheDocument();
  });
});
