import type {
  CoachCapacityReportRow,
  CoachCapacitySettings,
  CountedMembership,
} from '@learncraft-spanish/shared';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { applyCoachCapacitySettings } from '@domain/functions/coachCapacity';
import { CoachCapacityReport } from '@interface/components/CoachCapacity';
import editableTableStyles from '@interface/components/EditableTable/EditableTable.module.scss';
import {
  act,
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

/**
 * A coach as the API reports them: 0.5 Admin Time hours plus 2 group
 * sessions, so their Coaching Hours are `privateCallHours` + 2.5.
 */
function coachRow(
  coachId: number,
  fullName: string,
  {
    desiredHours,
    privateCallHours,
  }: { desiredHours: number | null; privateCallHours: number },
): CoachCapacityReportRow {
  return applyCoachCapacitySettings(
    createMockCoachCapacityReportRow({
      coach: { coach_id: coachId, fullName, email: 'coach@example.test' },
      privateCallHours,
      adminTimeHours: 0.5,
    }),
    {
      groupSessionsPerWeek: 2,
      projectsHours: 1.25,
      internalTimeHours: 0.5,
      teamMeetingHours: 1,
      desiredHours,
      notes: `${fullName} notes`,
    },
  );
}

const report: CoachCapacityReportRow[] = [
  // 6 Coaching Hours, 8.75 Committed Hours, 88%
  coachRow(1, 'Mostly Booked', { desiredHours: 10, privateCallHours: 3.5 }),
  coachRow(2, 'Not Set Up', { desiredHours: null, privateCallHours: 3.5 }),
  // 5.3333 Coaching Hours, 8.0833 Committed Hours, 40%
  coachRow(3, 'Lightly Booked', {
    desiredHours: 20,
    privateCallHours: 2.8333,
  }),
];

/** The same coaches two weeks out, with 4 Coaching Hours booked so far */
const twoWeeksOutReport: CoachCapacityReportRow[] = report.map((row) =>
  applyCoachCapacitySettings({ ...row, privateCallHours: 1.5 }, row.settings),
);

/** Serves `rows`, applying saved settings the way the API would */
function withSavedSettings(
  rows: CoachCapacityReportRow[],
  settingsByCoach: Map<number, CoachCapacitySettings>,
): CoachCapacityReportRow[] {
  return rows.map((row) => {
    const settings = settingsByCoach.get(row.coach.coach_id);
    return settings ? applyCoachCapacitySettings(row, settings) : row;
  });
}

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

/** Coaching Hours, Committed Hours, and Booked % */
function totals(fullName: string): string[] {
  const cells = within(coachTableRow(fullName)).getAllByRole('cell');
  return [1, 6, 8].map((index) => cells[index].textContent ?? '');
}

function isMarkedEdited(fullName: string): boolean {
  return (
    coachTableRow(fullName).querySelector(
      '.paste-table__cell-container--dirty',
    ) !== null
  );
}

function coachOrder(): string[] {
  return bodyRows().map(
    (row) => within(row).getAllByRole('cell')[0].textContent ?? '',
  );
}

/** Types into a coach's setting, keeping focus in it */
function typeSetting(fullName: string, label: string, value: string): void {
  const input = settingInput(fullName, label);
  act(() => input.focus());
  fireEvent.change(input, { target: { value } });
}

/** Moves focus out of the table, as clicking elsewhere on the page would */
function leaveTable(): void {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement) act(() => focused.blur());
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
          '8.08',
          '20.00',
          '40%',
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
      /** Lightly Booked's totals with 3 Projects hours in this period */
      const lightlyBookedWithThreeProjectsHours = {
        Today: ['5.33', '9.83', '49%'],
        'Two Weeks Out': ['4.00', '8.50', '43%'],
      }[label];
      const mostlyBookedTotals = {
        Today: ['6.00', '8.75', '88%'],
        'Two Weeks Out': ['4.00', '6.75', '68%'],
      }[label];

      /** Serves the report, applying saved settings the way the API would */
      function serveEditableReport(): void {
        const settingsByCoach = new Map<number, CoachCapacitySettings>();
        const rows = label === 'Today' ? report : twoWeeksOutReport;
        overrideMockAdminReportsAdapter({
          [fetch]: async () => withSavedSettings(rows, settingsByCoach),
          updateCoachCapacitySettings: async ({ coachId, settings }) => {
            settingsByCoach.set(coachId, settings);
            return settings;
          },
        });
      }

      it('has no Save or Discard buttons', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

        typeSetting('Lightly Booked', 'Projects', '3');

        expect(
          screen.queryByRole('button', { name: 'Save' }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Discard' }),
        ).not.toBeInTheDocument();
      });

      it('updates the coach’s totals while the admin types, without saving', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

        typeSetting('Lightly Booked', 'Projects', '3');

        expect(totals('Lightly Booked')).toEqual(
          lightlyBookedWithThreeProjectsHours,
        );
        expect(totals('Mostly Booked')).toEqual(mostlyBookedTotals);
        expect(isMarkedEdited('Lightly Booked')).toBe(true);
        expect(
          mockAdminReportsAdapter.updateCoachCapacitySettings,
        ).not.toHaveBeenCalled();
      });

      it('saves the coach’s full settings once when the admin leaves the cell, without refetching', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

        typeSetting('Lightly Booked', 'Projects', '3');
        leaveTable();

        await waitFor(() =>
          expect(isMarkedEdited('Lightly Booked')).toBe(false),
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
        expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
        expect(totals('Lightly Booked')).toEqual(
          lightlyBookedWithThreeProjectsHours,
        );
        expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledOnce();
      });

      it('saves once when the admin presses Enter, even as focus moves on', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

        typeSetting('Lightly Booked', 'Projects', '3');
        fireEvent.keyDown(settingInput('Lightly Booked', 'Projects'), {
          key: 'Enter',
        });
        leaveTable();

        await waitFor(() =>
          expect(isMarkedEdited('Lightly Booked')).toBe(false),
        );
        expect(
          mockAdminReportsAdapter.updateCoachCapacitySettings,
        ).toHaveBeenCalledOnce();
      });

      it('shows why input is invalid and neither saves it nor counts it', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);

        typeSetting('Mostly Booked', 'Group Sessions', '1.5');

        expect(await screen.findByRole('alert')).toHaveTextContent(
          'Enter a whole number from 0 to 40',
        );
        expect(totals('Mostly Booked')).toEqual(mostlyBookedTotals);
        leaveTable();
        expect(
          mockAdminReportsAdapter.updateCoachCapacitySettings,
        ).not.toHaveBeenCalled();
        expect(totals('Mostly Booked')).toEqual(mostlyBookedTotals);
      });

      it('keeps a value that failed to save, names the coach, and retries it on the next edit', async () => {
        serveEditableReport();
        overrideMockAdminReportsAdapter({
          updateCoachCapacitySettings: async () => {
            throw new Error('Failed to save Coach Capacity settings');
          },
        });
        renderReport();
        await openReport(label);

        typeSetting('Lightly Booked', 'Projects', '3');
        leaveTable();

        expect(await screen.findByRole('alert')).toHaveTextContent(
          'Could not save settings for Lightly Booked. Your changes are still in the table.',
        );
        expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
        expect(isMarkedEdited('Lightly Booked')).toBe(true);
        expect(totals('Lightly Booked')).toEqual(
          lightlyBookedWithThreeProjectsHours,
        );
        expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledOnce();

        serveEditableReport();
        typeSetting('Lightly Booked', 'Projects', '3.5');
        leaveTable();

        await waitFor(() =>
          expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
        );
        expect(
          mockAdminReportsAdapter.updateCoachCapacitySettings,
        ).toHaveBeenLastCalledWith({
          coachId: 3,
          settings: expect.objectContaining({ projectsHours: 3.5 }),
        });
        expect(isMarkedEdited('Lightly Booked')).toBe(false);
      });

      it('keeps rows in place while focus is in the table and re-sorts them once it leaves', async () => {
        serveEditableReport();
        renderReport();
        await openReport(label);
        const order = ['Not Set Up', 'Lightly Booked', 'Mostly Booked'];
        expect(coachOrder()).toEqual(order);

        // Over 100% booked on 5 Desired Hours, so most booked of all
        typeSetting('Lightly Booked', 'Desired Hours', '5');
        typeSetting('Not Set Up', 'Projects', '2');
        expect(coachOrder()).toEqual(order);

        leaveTable();
        expect(coachOrder()).toEqual([
          'Not Set Up',
          'Mostly Booked',
          'Lightly Booked',
        ]);
        await waitFor(() =>
          expect(
            mockAdminReportsAdapter.updateCoachCapacitySettings,
          ).toHaveBeenCalledTimes(2),
        );
      });

      it('edits a coach’s notes in a side panel and saves them with their settings, without refetching', async () => {
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
        expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledOnce();
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

/**
 * Serves both periods from one set of per-coach settings, the way the API
 * does: saving a coach's settings changes them in either period, while each
 * period keeps its own Coaching Hours.
 */
function serveReportsSharingSettings(): void {
  const settingsByCoach = new Map<number, CoachCapacitySettings>();
  overrideMockAdminReportsAdapter({
    getCoachCapacityTodayReport: async () =>
      withSavedSettings(report, settingsByCoach),
    getCoachCapacityTwoWeeksOutReport: async () =>
      withSavedSettings(twoWeeksOutReport, settingsByCoach),
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

describe('switching between Today and Two Weeks Out', () => {
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
    expect(isMarkedEdited('Lightly Booked')).toBe(true);
    // 4 + 3 + 0.5 + 1
    expect(totals('Lightly Booked')).toEqual(['4.00', '8.50', '43%']);
    selectPeriod('Today');
    await waitForPeriod(TODAY_HOURS);
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).not.toHaveBeenCalled();
  });

  it('keeps a value that failed to save, with its error, across a switch', async () => {
    serveReportsSharingSettings();
    overrideMockAdminReportsAdapter({
      updateCoachCapacitySettings: async () => {
        throw new Error('Failed to save Coach Capacity settings');
      },
    });
    renderReport();
    await openReport();

    typeSetting('Lightly Booked', 'Projects', '3');
    leaveTable();
    await screen.findByRole('alert');
    selectPeriod('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not save settings for Lightly Booked.',
    );
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(isMarkedEdited('Lightly Booked')).toBe(true);
    expect(totals('Lightly Booked')).toEqual(['4.00', '8.50', '43%']);
  });

  it('does not refetch on save, and shows the saved values in the other period when switched to', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport('Two Weeks Out');
    selectPeriod('Today');
    await waitForPeriod(TODAY_HOURS);

    typeSetting('Lightly Booked', 'Projects', '3');
    leaveTable();

    await waitFor(() => expect(isMarkedEdited('Lightly Booked')).toBe(false));
    // Today has 5.3333 Coaching Hours: 5.3333 + 3 + 0.5 + 1
    expect(totals('Lightly Booked')).toEqual(['5.33', '9.83', '49%']);
    // Opened and switched back to, but not refetched by the save
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);

    selectPeriod('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);

    // Two Weeks Out has 4 Coaching Hours: 4 + 3 + 0.5 + 1
    expect(totals('Lightly Booked')).toEqual(['4.00', '8.50', '43%']);
    expect(settingInput('Lightly Booked', 'Projects')).toHaveValue(3);
    expect(isMarkedEdited('Lightly Booked')).toBe(false);
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

describe('sorting by Committed Hours or Booked %', () => {
  // Today: Lightly Booked 8.08 Committed Hours (40%), Mostly Booked 8.75
  // (88%), Not Set Up 8.75 (no Booked %)
  function sortHeader(label: string): HTMLElement {
    return screen.getByRole('columnheader', { name: label });
  }

  /** Clicks a header the way a browser does, focusing it first */
  function clickSortHeader(label: string): void {
    const button = within(sortHeader(label)).getByRole('button');
    act(() => button.focus());
    fireEvent.click(button);
  }

  /** Each sortable header's `aria-sort` and the arrow it shows */
  function sortHeaders(): Record<string, string> {
    const headers = within(screen.getByRole('table')).getAllByRole(
      'columnheader',
    );
    return Object.fromEntries(
      headers
        .filter((header) => header.hasAttribute('aria-sort'))
        .map((header) => {
          const arrow = ['arrow-up', 'arrow-down', 'arrows-sort'].find(
            (glyph) => header.querySelector(`.tabler-icon-${glyph}`),
          );
          return [
            header.textContent ?? '',
            `${header.getAttribute('aria-sort')} ${arrow}`,
          ];
        }),
    );
  }

  it('opens on Booked % ascending with an up arrow, and only Committed Hours and Booked % are sortable', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    expect(sortHeaders()).toEqual({
      'Committed Hours': 'none arrows-sort',
      'Booked %': 'ascending arrow-up',
    });
    expect(
      within(sortHeader('Desired Hours')).queryByRole('button'),
    ).not.toBeInTheDocument();
    expect(coachOrder()).toEqual([
      'Not Set Up',
      'Lightly Booked',
      'Mostly Booked',
    ]);
  });

  it('switches Booked % between ascending and descending, keeping coaches who are not set up on top', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    clickSortHeader('Booked %');
    expect(sortHeaders()['Booked %']).toBe('descending arrow-down');
    expect(coachOrder()).toEqual([
      'Not Set Up',
      'Mostly Booked',
      'Lightly Booked',
    ]);

    clickSortHeader('Booked %');
    expect(sortHeaders()['Booked %']).toBe('ascending arrow-up');
    expect(coachOrder()).toEqual([
      'Not Set Up',
      'Lightly Booked',
      'Mostly Booked',
    ]);
  });

  it('takes Committed Hours ascending, then descending, then back to the default, breaking ties by name', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    clickSortHeader('Committed Hours');
    expect(sortHeaders()).toEqual({
      'Committed Hours': 'ascending arrow-up',
      'Booked %': 'none arrows-sort',
    });
    expect(coachOrder()).toEqual([
      'Lightly Booked',
      'Mostly Booked',
      'Not Set Up',
    ]);

    clickSortHeader('Committed Hours');
    expect(sortHeaders()['Committed Hours']).toBe('descending arrow-down');
    expect(coachOrder()).toEqual([
      'Mostly Booked',
      'Not Set Up',
      'Lightly Booked',
    ]);

    clickSortHeader('Committed Hours');
    expect(sortHeaders()).toEqual({
      'Committed Hours': 'none arrows-sort',
      'Booked %': 'ascending arrow-up',
    });
    expect(coachOrder()).toEqual([
      'Not Set Up',
      'Lightly Booked',
      'Mostly Booked',
    ]);
  });

  it('applies a clicked sort at once while editing, holds it, and sorts the live values once focus leaves', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();

    // 8.08 Committed Hours on 5 Desired Hours is 162%, most booked of all
    typeSetting('Lightly Booked', 'Desired Hours', '5');
    expect(coachOrder()).toEqual([
      'Not Set Up',
      'Lightly Booked',
      'Mostly Booked',
    ]);

    // Descending by the saved 40% would put Lightly Booked last
    clickSortHeader('Booked %');
    expect(coachOrder()).toEqual([
      'Not Set Up',
      'Lightly Booked',
      'Mostly Booked',
    ]);
    clickSortHeader('Committed Hours');
    expect(coachOrder()).toEqual([
      'Lightly Booked',
      'Mostly Booked',
      'Not Set Up',
    ]);

    // 8.75 - 1.25 Projects hours = 7.50 Committed Hours, now the fewest
    typeSetting('Mostly Booked', 'Projects', '0');
    expect(coachOrder()).toEqual([
      'Lightly Booked',
      'Mostly Booked',
      'Not Set Up',
    ]);

    leaveTable();
    expect(coachOrder()).toEqual([
      'Mostly Booked',
      'Lightly Booked',
      'Not Set Up',
    ]);
    await waitFor(() =>
      expect(
        mockAdminReportsAdapter.updateCoachCapacitySettings,
      ).toHaveBeenCalledTimes(2),
    );
  });

  it('keeps the sort across a switch to Two Weeks Out and back', async () => {
    serveReportsSharingSettings();
    renderReport();
    await openReport();
    clickSortHeader('Committed Hours');
    clickSortHeader('Committed Hours');

    // Clicking the toggle takes focus out of the table
    leaveTable();
    selectPeriod('Two Weeks Out');
    await waitForPeriod(TWO_WEEKS_OUT_HOURS);

    expect(sortHeaders()['Committed Hours']).toBe('descending arrow-down');
    // Every coach has 6.75 Committed Hours two weeks out, so by name
    expect(coachOrder()).toEqual([
      'Lightly Booked',
      'Mostly Booked',
      'Not Set Up',
    ]);

    selectPeriod('Today');
    await waitForPeriod(TODAY_HOURS);
    expect(sortHeaders()['Committed Hours']).toBe('descending arrow-down');
    expect(coachOrder()).toEqual([
      'Mostly Booked',
      'Not Set Up',
      'Lightly Booked',
    ]);
  });
});
