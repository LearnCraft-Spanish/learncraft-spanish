import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { CoachCapacityTodayReport } from '@interface/components/CoachCapacity';
import editableTableStyles from '@interface/components/EditableTable/EditableTable.module.scss';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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

/** What a cell shows: an input's value, otherwise its text */
function cellValue(cell: HTMLElement): string {
  const input = cell.querySelector('input');
  return input ? input.value : (cell.textContent ?? '');
}

function coachTableRow(fullName: string): HTMLElement {
  const row = screen.getByText(fullName).closest('tr');
  if (!row) throw new Error(`${fullName} is not in the table`);
  return row;
}

function settingInput(fullName: string, label: string): HTMLInputElement {
  return within(coachTableRow(fullName)).getByRole('spinbutton', {
    name: label,
  });
}

async function openReport(): Promise<void> {
  fireEvent.click(screen.getByText(TITLE));
  await screen.findByText('Mostly Booked');
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
      bodyRows().map((row) => within(row).getAllByRole('cell').map(cellValue)),
    ).toEqual([
      [
        'Not Set Up',
        '6.00',
        '2',
        '1.25',
        '0.50',
        '1.00',
        '8.75',
        '',
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

  it('shows an empty Desired Hours input with a dash for coaches who are not set up', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => report,
    });
    renderReport();
    await openReport();

    const desiredHours = settingInput('Not Set Up', 'Desired Hours');
    expect(desiredHours).toHaveValue(null);
    expect(desiredHours).toHaveAttribute('placeholder', '—');
  });
});

describe('editing coach capacity settings', () => {
  /** Serves the report, applying saved settings the way the API would */
  function serveEditableReport(): void {
    let current = report;
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => current,
      updateCoachCapacitySettings: async ({ coachId, settings }) => {
        current = current.map((row) =>
          row.coach.coach_id === coachId
            ? {
                ...row,
                settings,
                committedHours:
                  row.coachingHours +
                  settings.projectsHours +
                  settings.internalTimeHours +
                  settings.teamMeetingHours,
              }
            : row,
        );
        return settings;
      },
    });
  }

  it('saves the coach’s full settings and shows the refetched Committed Hours', async () => {
    serveEditableReport();
    renderReport();
    await openReport();

    fireEvent.change(settingInput('Lightly Booked', 'Projects'), {
      target: { value: '3' },
    });
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(
        within(coachTableRow('Lightly Booked')).getByText('9.83'),
      ).toBeInTheDocument(),
    );
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).toHaveBeenCalledExactlyOnceWith({
      coachId: 3,
      settings: {
        groupSessionsPerWeek: 2,
        projectsHours: 3,
        internalTimeHours: 0.5,
        teamMeetingHours: 1,
        desiredHours: 20,
        notes: 'Lightly Booked notes',
      },
    });
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(
      screen.queryByText('You have unsaved changes'),
    ).not.toBeInTheDocument();
  });

  it('shows why input is invalid and does not save it', async () => {
    serveEditableReport();
    renderReport();
    await openReport();

    const groupSessions = settingInput('Mostly Booked', 'Group Sessions');
    fireEvent.change(groupSessions, { target: { value: '1.5' } });
    fireEvent.focus(groupSessions);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a whole number from 0 to 40',
    );
    expect(
      screen.getByText('Please fix validation errors before saving'),
    ).toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    fireEvent.click(save);
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).not.toHaveBeenCalled();
  });

  it('shows an error and keeps the saved values when a save fails', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => report,
      updateCoachCapacitySettings: async () => {
        throw new Error('Failed to save Coach Capacity settings');
      },
    });
    renderReport();
    await openReport();

    fireEvent.change(settingInput('Lightly Booked', 'Projects'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save settings for Lightly Booked. Your changes are still in the table.',
    );
    const lightlyBooked = coachTableRow('Lightly Booked');
    expect(within(lightlyBooked).getByText('8.75')).toBeInTheDocument();
    expect(within(lightlyBooked).getByText('44%')).toBeInTheDocument();
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(1.25);
  });

  it('edits a coach’s notes in a side panel and saves them with their settings', async () => {
    serveEditableReport();
    renderReport();
    await openReport();

    fireEvent.click(
      screen.getByRole('button', { name: 'Mostly Booked notes' }),
    );
    const panel = screen.getByRole('dialog', { name: 'Notes: Mostly Booked' });
    const notes = within(panel).getByRole('textbox');
    expect(notes).toHaveValue('Mostly Booked notes');
    fireEvent.change(notes, { target: { value: 'Full until August' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Save notes' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).toHaveBeenCalledExactlyOnceWith({
      coachId: 1,
      settings: {
        groupSessionsPerWeek: 2,
        projectsHours: 1.25,
        internalTimeHours: 0.5,
        teamMeetingHours: 1,
        desiredHours: 10,
        notes: 'Full until August',
      },
    });
    expect(
      within(coachTableRow('Mostly Booked')).getByRole('button', {
        name: 'Full until August',
      }),
    ).toBeInTheDocument();
  });

  it('keeps the notes panel open with the draft when saving notes fails', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => report,
      updateCoachCapacitySettings: async () => {
        throw new Error('Failed to save Coach Capacity settings');
      },
    });
    renderReport();
    await openReport();

    fireEvent.click(
      screen.getByRole('button', { name: 'Mostly Booked notes' }),
    );
    const panel = screen.getByRole('dialog');
    fireEvent.change(within(panel).getByRole('textbox'), {
      target: { value: 'Full until August' },
    });
    fireEvent.click(within(panel).getByRole('button', { name: 'Save notes' }));

    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      'Notes could not be saved. Try again.',
    );
    expect(within(panel).getByRole('textbox')).toHaveValue('Full until August');
    expect(
      within(coachTableRow('Mostly Booked')).getByRole('button', {
        name: 'Mostly Booked notes',
      }),
    ).toBeInTheDocument();
  });
});
