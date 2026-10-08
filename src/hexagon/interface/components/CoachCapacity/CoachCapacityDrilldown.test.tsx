import type { CoachCapacityDrilldownState } from '@application/useCases/useCoachCapacityReport';
import type { CountedMembershipDisplayRow } from '@domain/functions/coachCapacity';
import { CoachCapacityDrilldown } from '@interface/components/CoachCapacity/CoachCapacityDrilldown';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const memberships: CountedMembershipDisplayRow[] = [
  {
    id: '0',
    student: 'Ana Student',
    course: 'Premier',
    startDate: 'Jan 05, 2026',
    endDate: '—',
    weeklyPrivateCalls: '2',
    weeklyAdminTime: '0.50',
  },
  {
    id: '1',
    student: 'Beto Student',
    course: 'Membership',
    startDate: 'Mar 02, 2026',
    endDate: 'Dec 31, 2026',
    weeklyPrivateCalls: '1',
    weeklyAdminTime: '0.25',
  },
];

function drilldownState(
  overrides: Partial<CoachCapacityDrilldownState> = {},
): CoachCapacityDrilldownState {
  return {
    coachName: 'Coach Ana',
    memberships,
    close: vi.fn(),
    ...overrides,
  };
}

describe('coach capacity drilldown', () => {
  it('renders nothing while no coach is open', () => {
    render(<CoachCapacityDrilldown {...drilldownState({ coachName: null })} />);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('lists each counted membership of the coach', () => {
    render(<CoachCapacityDrilldown {...drilldownState()} />);

    const table = screen.getByRole('table', {
      name: 'Memberships counted for Coach Ana',
    });
    const [header, ...body] = within(table).getAllByRole('row');
    expect(
      within(header)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual([
      'Student',
      'Course',
      'Start Date',
      'End Date',
      'Weekly Private Calls',
      'Weekly Admin Time (hrs)',
    ]);
    expect(
      body.map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ['Ana Student', 'Premier', 'Jan 05, 2026', '—', '2', '0.50'],
      [
        'Beto Student',
        'Membership',
        'Mar 02, 2026',
        'Dec 31, 2026',
        '1',
        '0.25',
      ],
    ]);
  });

  it('shows an empty state instead of a table when no memberships count', () => {
    render(<CoachCapacityDrilldown {...drilldownState({ memberships: [] })} />);

    expect(screen.getByText('No counted memberships')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('closes on Close', () => {
    const state = drilldownState();
    render(<CoachCapacityDrilldown {...state} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(state.close).toHaveBeenCalledOnce();
  });
});
