import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { EditableTable } from '@interface/components/EditableTable';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import styles from './EditableTable.module.scss';

const columns: ColumnDefinition[] = [
  { id: 'name', type: 'read-only', editable: false },
  { id: 'detail', type: 'read-only', editable: false },
  { id: 'total', type: 'read-only', editable: false },
];

const rows: TableRow[] = [
  { id: '1', cells: { name: 'Ana', detail: 'Mornings', total: '12' } },
];

function renderTable(displayConfig: ColumnDisplayConfig[]) {
  return render(
    <EditableTable
      rows={rows}
      columns={columns}
      displayConfig={displayConfig}
      dirtyRowIds={new Set()}
      validationErrors={{}}
      onCellChange={vi.fn()}
      isLoading={false}
      isSaving={false}
      isValid
      renderCell={({ value }) => <span>{value}</span>}
    />,
  );
}

describe('editableTable', () => {
  it('renders the table without a scroll container when nothing is pinned', () => {
    const { container } = renderTable([
      { id: 'name', label: 'Name' },
      { id: 'detail', label: 'Detail' },
      { id: 'total', label: 'Total' },
    ]);

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(
      container.querySelector(`.${styles.scrollContainer}`),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('table')).not.toHaveClass(styles.scrollingTable);
  });

  it('scrolls horizontally and keeps pinned columns in view', () => {
    const { container } = renderTable([
      { id: 'name', label: 'Name', width: '10rem', pinned: 'left' },
      { id: 'detail', label: 'Detail', width: '20rem' },
      { id: 'total', label: 'Total', width: '6rem', pinned: 'right' },
    ]);

    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass(styles.scrollContainer);
    expect(table).toHaveClass(styles.scrollingTable);

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    expect(nameHeader).toHaveClass(styles.pinnedLeft, styles.pinnedLeftEdge);
    expect(nameHeader).toHaveStyle({ left: '0px' });

    const [nameCell, detailCell, totalCell] = container.querySelectorAll('td');
    expect(nameCell).toHaveClass(styles.pinnedLeft);
    expect(detailCell).not.toHaveClass(styles.pinnedLeft, styles.pinnedRight);
    expect(totalCell).toHaveClass(styles.pinnedRight, styles.pinnedRightEdge);
    expect(totalCell).toHaveStyle({ right: '0px' });
  });
});
