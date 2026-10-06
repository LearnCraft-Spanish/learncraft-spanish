import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { CoachCapacityTodayReport } from '@interface/components/CoachCapacity';
import editableTableStyles from '@interface/components/EditableTable/EditableTable.module.scss';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMockCoachCapacityReportRow } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

const TITLE = 'Coach Capacity: Today';

function coachRow(
  coachId: number,
  fullName: string,
  overrides: Partial<CoachCapacityReportRow> & {
    desiredHours: number | null;
  },
): CoachCapacityReportRow {
  const { desiredHours, ...rowOverrides } = overrides;
  return createMockCoachCapacityReportRow({
    coach: { coach_id: coachId, fullName, email: 'coach@example.test' },
    settings: {
      groupSessionsPerWeek: 2,
      projectsHours: 1.25,
      internalTimeHours: 0.5,
      teamMeetingHours: 1,
      desiredHours,
      notes: `${fullName} notes`,
    },
    coachingHours: 6,
    committedHours: 8.75,
    ...rowOverrides,
  });
}

const report: CoachCapacityReportRow[] = [
  coachRow(1, 'Mostly Booked', { desiredHours: 10, bookedPercent: 87.5 }),
  coachRow(2, 'Not Set Up', { desiredHours: null, bookedPercent: null }),
  coachRow(3, 'Lightly Booked', {
    desiredHours: 20,
    bookedPercent: 43.75,
    coachingHours: 5.3333,
  }),
];

function renderReport() {
  return render(
    <TestQueryClientProvider>
      <CoachCapacityTodayReport />
    </TestQueryClientProvider>,
  );
}

function bodyRows(): HTMLElement[] {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('coach capacity today report', () => {
  it('is collapsed by default and does not fetch the report', () => {
    renderReport();

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).not.toHaveBeenCalled();
  });

  it('lists coaches least booked first with formatted values', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => report,
    });
    renderReport();

    fireEvent.click(screen.getByText(TITLE));
    await screen.findByText('Mostly Booked');

    expect(
      within(screen.getByRole('table'))
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual([
      'Coach',
      'Coaching Hours',
      'Group Sessions',
      'Projects',
      'Internal Time',
      'Team Meeting',
      'Committed Hours',
      'Desired Hours',
      'Booked %',
      'Notes',
    ]);
    expect(
      bodyRows().map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      [
        'Not Set Up',
        '6.00',
        '2',
        '1.25',
        '0.50',
        '1.00',
        '8.75',
        '—',
        '—',
        'Not Set Up notes',
      ],
      [
        'Lightly Booked',
        '5.33',
        '2',
        '1.25',
        '0.50',
        '1.00',
        '8.75',
        '20.00',
        '44%',
        'Lightly Booked notes',
      ],
      [
        'Mostly Booked',
        '6.00',
        '2',
        '1.25',
        '0.50',
        '1.00',
        '8.75',
        '10.00',
        '88%',
        'Mostly Booked notes',
      ],
    ]);
  });

  it('pins Coach, Committed Hours, Desired Hours, and Booked % while the rest scroll', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => report,
    });
    renderReport();

    fireEvent.click(screen.getByText(TITLE));
    await screen.findByText('Mostly Booked');

    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass(
      editableTableStyles.scrollContainer,
    );

    const pinning = within(table)
      .getAllByRole('columnheader')
      .map((header) => {
        if (header.classList.contains(editableTableStyles.pinnedLeft)) {
          return `${header.textContent}: left ${header.style.left}`;
        }
        if (header.classList.contains(editableTableStyles.pinnedRight)) {
          return `${header.textContent}: right ${header.style.right}`;
        }
        return `${header.textContent}: scrolls`;
      });
    expect(pinning).toEqual([
      'Coach: left 0px',
      'Coaching Hours: scrolls',
      'Group Sessions: scrolls',
      'Projects: scrolls',
      'Internal Time: scrolls',
      'Team Meeting: scrolls',
      'Committed Hours: right calc(13rem)',
      'Desired Hours: right 6rem',
      'Booked %: right 0px',
      'Notes: scrolls',
    ]);

    for (const row of bodyRows()) {
      const cells = within(row).getAllByRole('cell');
      expect(cells[0]).toHaveClass(editableTableStyles.pinnedLeft);
      expect(cells[1]).not.toHaveClass(
        editableTableStyles.pinnedLeft,
        editableTableStyles.pinnedRight,
      );
      expect(cells[6]).toHaveClass(editableTableStyles.pinnedRight);
      expect(cells[7]).toHaveClass(editableTableStyles.pinnedRight);
      expect(cells[8]).toHaveClass(editableTableStyles.pinnedRight);
      expect(cells[9]).not.toHaveClass(editableTableStyles.pinnedRight);
    }
  });

  it('refetches the report every time the section is opened', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => report,
    });
    renderReport();

    fireEvent.click(screen.getByText(TITLE));
    await screen.findByText('Mostly Booked');
    fireEvent.click(screen.getByText(TITLE));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(TITLE));
    await screen.findByText('Mostly Booked');

    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
  });

  it('shows an error when the report fails to load', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => {
        throw new Error('Failed to fetch Coach Capacity');
      },
    });
    renderReport();

    fireEvent.click(screen.getByText(TITLE));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Coach Capacity could not be loaded.',
    );
  });
});
