import type {
  DataTableColumn,
  DataTableRow,
} from '@interface/components/general/DataTable/DataTable';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './DataTable.module.scss';

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
    expect(screen.getByRole('columnheader', { name: 'Spanish' })).toHaveClass(
      styles.headerCell,
    );
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
      expect(row.style.getPropertyValue('--dt-columns')).toBe('1fr 1fr 80px');
    }
  });

  it('leaves gallery rows on the 56px floor instead of a finder min-height', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    const row = screen.getAllByRole('row')[1];

    expect(row).toHaveClass(styles.row);
    expect(row.style.getPropertyValue('--dt-row-min-height')).toBe('');
  });

  it('keeps the desktop grid at every width without a mobile layout', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    const row = screen.getAllByRole('row')[1];

    expect(row.style.getPropertyValue('--dt-mobile-columns')).toBe('');
    expect(screen.getByText('12')).not.toHaveClass(styles.hiddenOnMobile);
    expect(
      screen.getByRole('columnheader', { name: 'Lesson' }),
    ).not.toHaveClass(styles.hiddenOnMobile);
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

describe('data table finder grouping', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps parchment expand and row-level selected by default', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[
          {
            ...ROWS[0],
            selected: true,
            expanded: true,
            expandPanel: <span>detail</span>,
          },
        ]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
      />,
    );

    const sentence = screen.getByRole('row', { selected: true });
    const expand = screen.getByText('detail').closest('[role="row"]');

    expect(sentence).toHaveClass(styles.selected);
    expect(sentence.parentElement).not.toHaveClass(styles.selectedRecord);
    expect(expand).toHaveClass(styles.expandRow);
    expect(expand).not.toHaveClass(styles.expandFlush);
  });

  it('paints selected across the sentence and flush expand as one record', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[
          {
            ...ROWS[0],
            selected: true,
            expanded: true,
            expandPanel: <span>detail</span>,
          },
        ]}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
        expandTone="flush"
        groupSelection
        disableRowHover
      />,
    );

    const sentence = screen.getByRole('row', { selected: true });
    const expand = screen.getByText('detail').closest('[role="row"]');

    expect(sentence).not.toHaveClass(styles.selected);
    expect(sentence.parentElement).toHaveClass(styles.selectedRecord);
    expect(sentence.parentElement).toContainElement(screen.getByText('detail'));
    expect(expand).toHaveClass(styles.expandFlush);
    expect(screen.getByRole('table')).toHaveClass(styles.noRowHover);
  });
});

describe('data table mobile reflow', () => {
  const MOBILE_COLUMNS: DataTableColumn[] = [
    { id: 'spanish', header: 'Spanish', mobileArea: 'spanish' },
    { id: 'english', header: 'English', mobileArea: 'english' },
    { id: 'lesson', header: 'Lesson', align: 'end' },
  ];

  const MOBILE_LAYOUT = {
    columnTemplate: '1fr',
    templateAreas: '"spanish" "english"',
  };

  function renderReflowed(): void {
    render(
      <DataTable
        columns={MOBILE_COLUMNS}
        rows={ROWS}
        columnTemplate="1fr 1fr 80px"
        caption="Search results"
        mobileLayout={MOBILE_LAYOUT}
      />,
    );
  }

  afterEach(() => {
    cleanup();
  });

  it('passes both grids to every row', () => {
    renderReflowed();

    const row = screen.getAllByRole('row')[1];

    expect(row.style.getPropertyValue('--dt-columns')).toBe('1fr 1fr 80px');
    expect(row.style.getPropertyValue('--dt-mobile-columns')).toBe('1fr');
    expect(row.style.getPropertyValue('--dt-mobile-areas')).toBe(
      '"spanish" "english"',
    );
  });

  it('places each mapped cell in its named area', () => {
    renderReflowed();

    expect(
      screen.getByText('Como tacos').style.getPropertyValue('--dt-mobile-area'),
    ).toBe('spanish');
    expect(
      screen
        .getByText('I eat tacos')
        .style.getPropertyValue('--dt-mobile-area'),
    ).toBe('english');
  });

  it('hides a column that has no mobile area, header included', () => {
    renderReflowed();

    expect(screen.getByText('12')).toHaveClass(styles.hiddenOnMobile);
    expect(screen.getByRole('columnheader', { name: 'Lesson' })).toHaveClass(
      styles.hiddenOnMobile,
    );
  });

  it('keeps the mapped columns visible, headers included', () => {
    renderReflowed();

    expect(screen.getByText('Como tacos')).toHaveClass(styles.placed);
    expect(screen.getByText('Como tacos')).not.toHaveClass(
      styles.hiddenOnMobile,
    );
    expect(screen.getByRole('columnheader', { name: 'Spanish' })).toHaveClass(
      styles.placed,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Spanish' }),
    ).not.toHaveClass(styles.hiddenOnMobile);
  });
});
