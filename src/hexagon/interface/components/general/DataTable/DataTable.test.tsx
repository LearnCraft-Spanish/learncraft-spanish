import type {
  DataTableColumn,
  DataTableRow,
} from '@interface/components/general/DataTable/DataTable';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const COLUMNS: DataTableColumn[] = [
  { id: 'spanish', header: 'Spanish' },
  { id: 'english', header: 'English' },
  { id: 'lesson', header: 'Lesson', align: 'end' },
];

const ROWS: DataTableRow[] = [
  { id: 'a', cells: ['Como tacos', 'I eat tacos', '12'] },
  { id: 'b', cells: ['Bebo agua', 'I drink water', '14'] },
];

describe('data table', () => {
  afterEach(() => {
    cleanup();
  });

  it('is named by its caption', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.getByRole('table')).toHaveAccessibleName('Search results');
  });

  it('renders a header per column', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('renders a row per record, plus the header row', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('I drink water')).toBeInTheDocument();
  });

  it('applies the caller column template to every row', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    for (const row of screen.getAllByRole('row')) {
      expect(row).toHaveStyle({ gridTemplateColumns: '1fr 1fr 80px' });
    }
  });

  it('marks a selected row', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[{ ...ROWS[0], selected: true }, ROWS[1]]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.getAllByRole('row', { selected: true })).toHaveLength(1);
  });

  it('shows an expand panel only while the row is expanded', () => {
    const { rerender } = render(
      <DataTable
        columns={COLUMNS}
        rows={[
          { ...ROWS[0], expanded: false, expandPanel: <span>detail</span> },
        ]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.queryByText('detail')).not.toBeInTheDocument();

    rerender(
      <DataTable
        columns={COLUMNS}
        rows={[
          { ...ROWS[0], expanded: true, expandPanel: <span>detail</span> },
        ]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.getByText('detail')).toBeInTheDocument();
  });

  it('shows the empty state when there are no rows', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
        emptyState={<span>No examples match these filters</span>}
      />,
    );

    expect(
      screen.getByText('No examples match these filters'),
    ).toBeInTheDocument();
  });

  it('renders no body and no empty state when neither is given', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
