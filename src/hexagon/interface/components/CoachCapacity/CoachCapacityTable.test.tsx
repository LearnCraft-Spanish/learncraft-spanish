import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { CoachCapacityTable } from '@interface/components/CoachCapacity/CoachCapacityTable';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import styles from './CoachCapacityTable.module.scss';

const columns: ColumnDefinition[] = [
  { id: 'coach', type: 'read-only', editable: false },
  { id: 'coachingHours', type: 'number', editable: false },
  { id: 'notes', type: 'textarea', editable: false },
];

const rows: TableRow[] = [
  {
    id: '7',
    cells: { coach: 'Coach Ana', coachingHours: '9.33', notes: 'Mornings' },
  },
];

describe('coach capacity table', () => {
  it('renders each row with numbers and text aligned by column', () => {
    render(
      <CoachCapacityTable
        rows={rows}
        columns={columns}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText('Coach Ana')).toHaveClass(styles.textCell);
    expect(screen.getByText('9.33')).toHaveClass(styles.numberCell);
    expect(screen.getByText('Mornings')).toHaveClass(styles.textCell);
  });

  it('shows a loading state while the report loads', () => {
    render(
      <CoachCapacityTable
        rows={[]}
        columns={columns}
        isLoading
        isError={false}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading table data...',
    );
    expect(screen.queryByText('No coaches found')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no coaches', () => {
    render(
      <CoachCapacityTable
        rows={[]}
        columns={columns}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText('No coaches found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error instead of the table when the report fails to load', () => {
    render(
      <CoachCapacityTable
        rows={rows}
        columns={columns}
        isLoading={false}
        isError
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Coach Capacity could not be loaded.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
