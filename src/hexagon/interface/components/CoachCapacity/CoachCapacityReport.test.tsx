import type {
  CoachCapacityReportRow,
  CountedMembership,
} from '@learncraft-spanish/shared';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { CoachCapacityReport } from '@interface/components/CoachCapacity';
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

const TITLE = 'Coach Capacity';

const periods = [
  { label: 'Today', fetch: 'getCoachCapacityTodayReport' },
  { label: 'Two Weeks Out', fetch: 'getCoachCapacityTwoWeeksOutReport' },
] as const;

type PeriodLabel = (typeof periods)[number]['label'];

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

/** The same coaches two weeks out, with fewer Coaching Hours booked so far */
const twoWeeksOutReport: CoachCapacityReportRow[] = report.map((row) => ({
  ...row,
  coachingHours: 4,
  committedHours: 6.75,
}));

const anaMembership: CountedMembership = {
  studentName: 'Ana Student',
  courseName: 'Premier',
  startDate: '2026-01-05',
  endDate: null,
  courseWeeklyPrivateCalls: 2,
  courseWeeklyAdminTimeMinutes: 30,
};

const betoMembership: CountedMembership = {
  studentName: 'Beto Student',
  courseName: 'Membership',
  startDate: '2026-10-12',
  endDate: '2027-04-12',
  courseWeeklyPrivateCalls: 1,
  courseWeeklyAdminTimeMinutes: 15,
};

/** Only Mostly Booked has counted memberships */
function withMemberships(
  rows: CoachCapacityReportRow[],
  memberships: CountedMembership[],
): CoachCapacityReportRow[] {
  return rows.map((row) => ({
    ...row,
    countedMemberships:
      row.coach.fullName === 'Mostly Booked' ? memberships : [],
  }));
}

function drilldownRows(container: HTMLElement): string[][] {
  return within(within(container).getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent ?? ''),
    );
}

function renderReport() {
  return render(
    <TestQueryClientProvider>
      <CoachCapacityReport />
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

function periodToggle(): HTMLElement {
  return screen.getByRole('group', { name: 'Report period' });
}

function selectPeriod(label: PeriodLabel): void {
  fireEvent.click(within(periodToggle()).getByRole('button', { name: label }));
}

function selectedPeriod(): string | null {
  return within(periodToggle()).getByRole('button', { pressed: true })
    .textContent;
}

function toggleSection(): void {
  fireEvent.click(screen.getByText(TITLE));
}

/** Opens the section, switches to `label` unless it is Today, and waits for the coaches */
async function openReport(label: PeriodLabel = 'Today'): Promise<void> {
  toggleSection();
  if (label !== 'Today') selectPeriod(label);
  await screen.findByText('Mostly Booked');
}

describe.each(periods)(
  'coach Capacity report showing $label',
  ({ label, fetch }) => {
    it('lists coaches least booked first with formatted values', async () => {
      overrideMockAdminReportsAdapter({ [fetch]: async () => report });
      renderReport();

      await openReport(label);

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
          within(row).getAllByRole('cell').map(cellValue),
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
      expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledTimes(1);
    });

    it('pins Coach, Committed Hours, Desired Hours, and Booked % while the rest scroll', async () => {
      overrideMockAdminReportsAdapter({ [fetch]: async () => report });
      renderReport();

      await openReport(label);

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

    it('shows an error when the report fails to load', async () => {
      overrideMockAdminReportsAdapter({
        [fetch]: async () => {
          throw new Error('Failed to fetch Coach Capacity');
        },
      });
      renderReport();

      toggleSection();
      if (label !== 'Today') selectPeriod(label);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Coach Capacity could not be loaded.',
      );
    });

    it('shows an empty Desired Hours input with a dash for coaches who are not set up', async () => {
      overrideMockAdminReportsAdapter({ [fetch]: async () => report });
      renderReport();
      await openReport(label);

      const desiredHours = settingInput('Not Set Up', 'Desired Hours');
      expect(desiredHours).toHaveValue(null);
      expect(desiredHours).toHaveAttribute('placeholder', '—');
    });

    describe('editing coach capacity settings', () => {
      /** Serves the report, applying saved settings the way the API would */
      function serveEditableReport(): void {
        let current = report;
        overrideMockAdminReportsAdapter({
          [fetch]: async () => current,
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
        await openReport(label);

        fireEvent.change(settingInput('Lightly Booked', 'Projects'), {
          target: { value: '3' },
        });
        expect(
          screen.getByText('You have unsaved changes'),
        ).toBeInTheDocument();
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
        expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledTimes(2);
        expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
        expect(
          screen.queryByText('You have unsaved changes'),
        ).not.toBeInTheDocument();
      });

      it('shows why input is invalid and does not save it', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

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
          [fetch]: async () => report,
          updateCoachCapacitySettings: async () => {
            throw new Error('Failed to save Coach Capacity settings');
          },
        });
        renderReport();
        await openReport(label);

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
        expect(
          screen.getByText('You have unsaved changes'),
        ).toBeInTheDocument();
        expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(1.25);
      });

      it('edits a coach’s notes in a side panel and saves them with their settings', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

        fireEvent.click(
          screen.getByRole('button', { name: 'Mostly Booked notes' }),
        );
        const panel = screen.getByRole('dialog', {
          name: 'Notes: Mostly Booked',
        });
        const notes = within(panel).getByRole('textbox');
        expect(notes).toHaveValue('Mostly Booked notes');
        fireEvent.change(notes, { target: { value: 'Full until August' } });
        fireEvent.click(
          within(panel).getByRole('button', { name: 'Save notes' }),
        );

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
          [fetch]: async () => report,
          updateCoachCapacitySettings: async () => {
            throw new Error('Failed to save Coach Capacity settings');
          },
        });
        renderReport();
        await openReport(label);

        fireEvent.click(
          screen.getByRole('button', { name: 'Mostly Booked notes' }),
        );
        const panel = screen.getByRole('dialog');
        fireEvent.change(within(panel).getByRole('textbox'), {
          target: { value: 'Full until August' },
        });
        fireEvent.click(
          within(panel).getByRole('button', { name: 'Save notes' }),
        );

        expect(await within(panel).findByRole('alert')).toHaveTextContent(
          'Notes could not be saved. Try again.',
        );
        expect(within(panel).getByRole('textbox')).toHaveValue(
          'Full until August',
        );
        expect(
          within(coachTableRow('Mostly Booked')).getByRole('button', {
            name: 'Mostly Booked notes',
          }),
        ).toBeInTheDocument();
      });
    });

    describe('counted memberships drilldown', () => {
      it('opens on a clicked coach and lists the memberships behind their Coaching Hours', async () => {
        overrideMockAdminReportsAdapter({
          [fetch]: async () =>
            withMemberships(report, [anaMembership, betoMembership]),
        });
        renderReport();
        await openReport(label);

        expect(screen.queryByText(/Memberships counted for/)).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Mostly Booked' }));

        const drilldown = screen.getByRole('region', {
          name: 'Memberships counted for Mostly Booked',
        });
        expect(drilldownRows(drilldown)).toEqual([
          ['Ana Student', 'Premier', 'Jan 05, 2026', '—', '2', '0.50'],
          [
            'Beto Student',
            'Membership',
            'Oct 12, 2026',
            'Apr 12, 2027',
            '1',
            '0.25',
          ],
        ]);
      });

      it('shows an empty state for a coach with no counted memberships', async () => {
        overrideMockAdminReportsAdapter({
          [fetch]: async () => withMemberships(report, [anaMembership]),
        });
        renderReport();
        await openReport(label);

        fireEvent.click(screen.getByRole('button', { name: 'Not Set Up' }));

        const drilldown = screen.getByRole('region', {
          name: 'Memberships counted for Not Set Up',
        });
        expect(
          within(drilldown).getByText('No counted memberships'),
        ).toBeInTheDocument();
        expect(within(drilldown).queryByRole('table')).not.toBeInTheDocument();
      });

      it('switches to another clicked coach and closes on Close', async () => {
        overrideMockAdminReportsAdapter({
          [fetch]: async () => withMemberships(report, [anaMembership]),
        });
        renderReport();
        await openReport(label);

        fireEvent.click(screen.getByRole('button', { name: 'Mostly Booked' }));
        fireEvent.click(screen.getByRole('button', { name: 'Lightly Booked' }));

        const drilldown = screen.getByRole('region', {
          name: 'Memberships counted for Lightly Booked',
        });
        expect(
          screen.queryByRole('region', {
            name: 'Memberships counted for Mostly Booked',
          }),
        ).not.toBeInTheDocument();

        fireEvent.click(
          within(drilldown).getByRole('button', { name: 'Close' }),
        );
        expect(screen.queryByText(/Memberships counted for/)).toBeNull();
      });
    });
  },
);

describe('switching between Today and Two Weeks Out', () => {
  /**
   * Serves both periods from one set of per-coach settings, the way the API
   * does: saving a coach's settings changes them in either period, while each
   * period keeps its own Coaching Hours.
   */
  function serveReportsSharingSettings(): void {
    const settingsByCoach = new Map(
      report.map((row) => [row.coach.coach_id, row.settings]),
    );
    const withSavedSettings = (
      rows: CoachCapacityReportRow[],
    ): CoachCapacityReportRow[] =>
      rows.map((row) => {
        const settings = settingsByCoach.get(row.coach.coach_id);
        return settings
          ? {
              ...row,
              settings,
              committedHours:
                row.coachingHours +
                settings.projectsHours +
                settings.internalTimeHours +
                settings.teamMeetingHours,
            }
          : row;
      });

    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => withSavedSettings(report),
      getCoachCapacityTwoWeeksOutReport: async () =>
        withSavedSettings(twoWeeksOutReport),
      updateCoachCapacitySettings: async ({ coachId, settings }) => {
        settingsByCoach.set(coachId, settings);
        return settings;
      },
    });
  }

  /** Waits for the period whose Coaching Hours for Lightly Booked are `coachingHours` */
  async function waitForPeriod(coachingHours: string): Promise<void> {
    await waitFor(() =>
      expect(
        within(coachTableRow('Lightly Booked')).getByText(coachingHours),
      ).toBeInTheDocument(),
    );
  }

  const TODAY_HOURS = '5.33';
  const TWO_WEEKS_OUT_HOURS = '4.00';

  it('is one collapsed Coach Capacity section that fetches nothing and shows no toggle', () => {
    renderReport();

    expect(
      screen
        .getAllByRole('region')
        .map((region) => region.getAttribute('aria-label')),
    ).toEqual([TITLE]);
    expect(
      screen.queryByRole('group', { name: 'Report period' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).not.toHaveBeenCalled();
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).not.toHaveBeenCalled();
  });

  it('opens on Today with a Today | Two Weeks Out toggle in its header', async () => {
    serveReportsSharingSettings();
    renderReport();

    await openReport();
    await waitForPeriod(TODAY_HOURS);

    expect(
      within(periodToggle())
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Today', 'Two Weeks Out']);
    expect(selectedPeriod()).toBe('Today');
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledOnce();
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).not.toHaveBeenCalled();
  });

  it('fetches the selected period on every switch', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    selectPeriod('Two Weeks Out');
    expect(selectedPeriod()).toBe('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);
    // Committed Hours is Coaching Hours plus Projects, Internal Time, and Team
    // Meeting (1.25 + 0.5 + 1)
    expect(
      within(coachTableRow('Lightly Booked')).getByText('6.75'),
    ).toBeInTheDocument();
    selectPeriod('Today');
    await waitForPeriod(TODAY_HOURS);
    selectPeriod('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);

    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledTimes(2);
  });

  it('opens on Today every time it is opened, refetching it', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport('Two Weeks Out');

    toggleSection();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Report period' }),
    ).not.toBeInTheDocument();
    toggleSection();

    expect(selectedPeriod()).toBe('Today');
    await waitForPeriod(TODAY_HOURS);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledOnce();
  });

  it('keeps unsaved edits across a switch', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    fireEvent.change(settingInput('Lightly Booked', 'Projects'), {
      target: { value: '3' },
    });
    selectPeriod('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);

    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    selectPeriod('Today');
    await waitForPeriod(TODAY_HOURS);
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).not.toHaveBeenCalled();
  });

  it('refreshes the period being viewed on save, and shows the saved values in the other when switched to', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport('Two Weeks Out');
    selectPeriod('Today');
    await waitForPeriod(TODAY_HOURS);

    fireEvent.change(settingInput('Lightly Booked', 'Projects'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Today has 5.3333 Coaching Hours: 5.3333 + 3 + 0.5 + 1
    await waitFor(() =>
      expect(
        within(coachTableRow('Lightly Booked')).getByText('9.83'),
      ).toBeInTheDocument(),
    );
    // Opened, switched back to, then refetched by the save
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(3);

    selectPeriod('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);

    // Two Weeks Out has 4 Coaching Hours: 4 + 3 + 0.5 + 1
    expect(
      within(coachTableRow('Lightly Booked')).getByText('8.50'),
    ).toBeInTheDocument();
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(
      screen.queryByText('You have unsaved changes'),
    ).not.toBeInTheDocument();
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).toHaveBeenCalledOnce();
  });

  it('keeps the Notes panel open with its unsaved draft across a switch', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    fireEvent.click(
      screen.getByRole('button', { name: 'Mostly Booked notes' }),
    );
    fireEvent.change(
      within(
        screen.getByRole('dialog', { name: 'Notes: Mostly Booked' }),
      ).getByRole('textbox'),
      { target: { value: 'Full until August' } },
    );
    selectPeriod('Two Weeks Out');

    const panel = screen.getByRole('dialog', { name: 'Notes: Mostly Booked' });
    expect(within(panel).getByRole('textbox')).toHaveValue('Full until August');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);
    expect(
      within(
        screen.getByRole('dialog', { name: 'Notes: Mostly Booked' }),
      ).getByRole('textbox'),
    ).toHaveValue('Full until August');

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Save notes',
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).toHaveBeenCalledExactlyOnceWith({
      coachId: 1,
      settings: expect.objectContaining({ notes: 'Full until August' }),
    });
    expect(
      within(coachTableRow('Mostly Booked')).getByRole('button', {
        name: 'Full until August',
      }),
    ).toBeInTheDocument();
  });

  it('keeps the drilldown on the same coach, showing their memberships in the newly selected period', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        withMemberships(report, [anaMembership]),
      getCoachCapacityTwoWeeksOutReport: async () =>
        withMemberships(twoWeeksOutReport, [anaMembership, betoMembership]),
    });
    renderReport();
    await openReport();
    fireEvent.click(screen.getByRole('button', { name: 'Mostly Booked' }));

    const studentsShown = (): string[] =>
      drilldownRows(
        screen.getByRole('region', {
          name: 'Memberships counted for Mostly Booked',
        }),
      ).map(([student]) => student);
    expect(studentsShown()).toEqual(['Ana Student']);

    selectPeriod('Two Weeks Out');
    expect(
      within(
        screen.getByRole('region', {
          name: 'Memberships counted for Mostly Booked',
        }),
      ).getByText('Loading memberships...'),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(studentsShown()).toEqual(['Ana Student', 'Beto Student']),
    );
  });

  it('keeps the drilldown open with an empty state when the coach has no memberships in the newly selected period', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        withMemberships(report, [anaMembership]),
      getCoachCapacityTwoWeeksOutReport: async () =>
        withMemberships(twoWeeksOutReport, []),
    });
    renderReport();
    await openReport();
    fireEvent.click(screen.getByRole('button', { name: 'Mostly Booked' }));

    selectPeriod('Two Weeks Out');

    const drilldown = screen.getByRole('region', {
      name: 'Memberships counted for Mostly Booked',
    });
    expect(
      await within(drilldown).findByText('No counted memberships'),
    ).toBeInTheDocument();
    expect(within(drilldown).queryByRole('table')).not.toBeInTheDocument();
  });
});
