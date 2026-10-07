import type { CoachCapacityNotesPanelState } from '@application/useCases/useCoachCapacityReport';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CoachCapacityTableProps } from '@interface/components/CoachCapacity/CoachCapacityTable';
import type { EditableTableUseCaseProps } from '@interface/components/EditableTable/types';
import { CoachCapacityTable } from '@interface/components/CoachCapacity/CoachCapacityTable';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import styles from './CoachCapacityTable.module.scss';

const columns: ColumnDefinition[] = [
  { id: 'coach', type: 'read-only', editable: false },
  { id: 'coachingHours', type: 'number', editable: false },
  { id: 'projectsHours', type: 'number' },
  { id: 'notes', type: 'custom', editable: false },
];

const rows: TableRow[] = [
  {
    id: '7',
    cells: {
      coach: 'Coach Ana',
      coachingHours: '9.33',
      projectsHours: '1.25',
      notes: 'Mornings',
    },
  },
  {
    id: '8',
    cells: {
      coach: 'Coach Beto',
      coachingHours: '2.00',
      projectsHours: '0.00',
      notes: '',
    },
  },
];

function tableProps(
  overrides: Partial<EditableTableUseCaseProps> = {},
): EditableTableUseCaseProps {
  return {
    rows,
    columns,
    dirtyRowIds: new Set(),
    validationErrors: {},
    onCellChange: () => {},
    isLoading: false,
    isSaving: false,
    isValid: true,
    ...overrides,
  };
}

const closedNotesPanel: CoachCapacityNotesPanelState = {
  coachName: null,
  draft: '',
  setDraft: () => {},
  close: () => {},
  save: async () => {},
  isSaving: false,
  error: null,
};

function renderTable(overrides: Partial<CoachCapacityTableProps> = {}) {
  return render(
    <CoachCapacityTable
      tableProps={tableProps()}
      isError={false}
      saveError={null}
      onOpenNotes={() => {}}
      notesPanel={closedNotesPanel}
      {...overrides}
    />,
  );
}

describe('coach capacity table', () => {
  it('shows read-only values aligned by column and settings as inputs', () => {
    renderTable();

    expect(screen.getByText('Coach Ana')).toHaveClass(
      styles.textCell,
      styles.readOnlyCell,
    );
    expect(screen.getByText('9.33')).toHaveClass(
      styles.numberCell,
      styles.readOnlyCell,
    );
    expect(document.querySelectorAll(`.${styles.readOnlyCell}`)).toHaveLength(
      4,
    );
    expect(
      screen.getAllByRole('spinbutton', { name: 'Projects' }),
    ).toHaveLength(2);
    expect(screen.getByDisplayValue('1.25')).toBeInTheDocument();
  });

  it('opens the notes of the coach whose Notes cell is clicked', () => {
    const onOpenNotes = vi.fn();
    renderTable({ onOpenNotes });

    fireEvent.click(screen.getByRole('button', { name: 'Mornings' }));

    expect(onOpenNotes).toHaveBeenCalledExactlyOnceWith('7');
  });

  it('invites adding notes to a coach without any', () => {
    const onOpenNotes = vi.fn();
    renderTable({ onOpenNotes });

    fireEvent.click(screen.getByRole('button', { name: 'Add notes' }));

    expect(onOpenNotes).toHaveBeenCalledExactlyOnceWith('8');
  });

  it('shows the save error above the table', () => {
    renderTable({ saveError: 'Could not save settings for Coach Ana.' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not save settings for Coach Ana.',
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows the notes panel when it is open', () => {
    renderTable({
      notesPanel: { ...closedNotesPanel, coachName: 'Coach Ana' },
    });

    expect(
      within(screen.getByRole('dialog')).getByRole('heading'),
    ).toHaveTextContent('Notes: Coach Ana');
  });

  it('shows a loading state while the report loads', () => {
    renderTable({ tableProps: tableProps({ rows: [], isLoading: true }) });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading table data...',
    );
    expect(screen.queryByText('No coaches found')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no coaches', () => {
    renderTable({ tableProps: tableProps({ rows: [] }) });

    expect(screen.getByText('No coaches found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error instead of the table when the report fails to load', () => {
    renderTable({ isError: true });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Coach Capacity could not be loaded.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
