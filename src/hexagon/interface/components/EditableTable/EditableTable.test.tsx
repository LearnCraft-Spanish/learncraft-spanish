import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
  EditableTableProps,
} from '@interface/components/EditableTable/types';
import { EditableTable } from '@interface/components/EditableTable';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('editableTable behavior', () => {
  const editableColumns: ColumnDefinition[] = [
    { id: 'name', type: 'text' },
    { id: 'detail', type: 'text' },
  ];
  const editableRows: TableRow[] = [
    { id: '1', cells: { name: 'Ana', detail: 'Mornings' } },
    { id: '2', cells: { name: 'Luis', detail: 'Evenings' } },
  ];
  const editableDisplay: ColumnDisplayConfig[] = [
    { id: 'name', label: 'Name' },
    { id: 'detail', label: 'Detail' },
  ];

  function renderInput({
    value,
    display,
    onChange,
    onFocus,
    onBlur,
    cellRef,
  }: CellRenderProps) {
    return (
      <input
        ref={cellRef}
        aria-label={`${display.label} input`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  }

  function tableProps(
    props: Partial<EditableTableProps> = {},
  ): EditableTableProps {
    return {
      rows: editableRows,
      columns: editableColumns,
      displayConfig: editableDisplay,
      dirtyRowIds: new Set(),
      validationErrors: {},
      onCellChange: vi.fn(),
      renderCell: renderInput,
      isLoading: false,
      isSaving: false,
      isValid: true,
      ...props,
    };
  }

  function renderEditable(props: Partial<EditableTableProps> = {}) {
    return render(<EditableTable {...tableProps(props)} />);
  }

  it('shows a loading message instead of the table and its buttons while loading', () => {
    renderEditable({ isLoading: true, onSave: vi.fn(), onDiscard: vi.fn() });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading table data...',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
  });

  it('shows the table and no loading message once loaded', () => {
    renderEditable({ isLoading: false });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders a header per column and a row per data row, using the cell renderer', () => {
    renderEditable();

    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Detail' }),
    ).toBeInTheDocument();
    // One header row plus one row per data row
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByLabelText('Name input')[1]).toHaveValue('Luis');
    expect(screen.getAllByLabelText('Detail input')[0]).toHaveValue('Mornings');
  });

  it('labels a column with its id when no display config exists for it', () => {
    renderEditable({ displayConfig: [{ id: 'name', label: 'Name' }] });

    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'detail' }),
    ).toBeInTheDocument();
  });

  it('reports a cell edit with the row, column and new value', async () => {
    const user = userEvent.setup();
    const onCellChange = vi.fn();
    renderEditable({ onCellChange });

    await user.type(screen.getAllByLabelText('Detail input')[1], '!');

    expect(onCellChange).toHaveBeenCalledExactlyOnceWith(
      '2',
      'detail',
      'Evenings!',
    );
  });

  it('adds a custom class name to the table wrapper, and no stray text without one', () => {
    const { container, rerender } = renderEditable({ className: 'my-table' });
    expect(container.firstElementChild).toHaveClass('paste-table', 'my-table');

    rerender(<EditableTable {...tableProps()} />);
    expect(container.firstElementChild?.className).not.toContain('undefined');
    expect(container.firstElementChild).not.toHaveClass('my-table');
  });

  it('hands pasted clipboard events to onPaste', () => {
    const onPaste = vi.fn();
    renderEditable({ onPaste });

    fireEvent.paste(screen.getAllByLabelText('Name input')[0]);

    expect(onPaste).toHaveBeenCalledTimes(1);
  });

  describe('active cell tracking', () => {
    it('tells the use case which cell is focused, and when focus leaves it', async () => {
      const user = userEvent.setup();
      const setActiveCellInfo = vi.fn();
      const clearActiveCellInfo = vi.fn();
      renderEditable({ setActiveCellInfo, clearActiveCellInfo });

      await user.click(screen.getAllByLabelText('Detail input')[1]);
      expect(setActiveCellInfo).toHaveBeenCalledExactlyOnceWith('2', 'detail');
      expect(clearActiveCellInfo).not.toHaveBeenCalled();

      await user.tab();
      expect(clearActiveCellInfo).toHaveBeenCalledTimes(1);
    });

    it('marks only the focused cell as selected', async () => {
      const user = userEvent.setup();
      renderEditable();
      const nameCell = screen.getAllByLabelText('Name input')[0].closest('td');
      const detailCell = screen
        .getAllByLabelText('Detail input')[0]
        .closest('td');

      await user.click(screen.getAllByLabelText('Name input')[0]);
      expect(nameCell).toHaveAttribute('aria-selected', 'true');
      expect(detailCell).not.toHaveAttribute('aria-selected');

      await user.tab();
      expect(nameCell).not.toHaveAttribute('aria-selected');
      expect(detailCell).toHaveAttribute('aria-selected', 'true');
    });

    it('works without the optional focus callbacks', async () => {
      const user = userEvent.setup();
      renderEditable();

      await user.click(screen.getAllByLabelText('Name input')[0]);
      await user.tab();

      expect(screen.getAllByLabelText('Name input')[0]).toBeInTheDocument();
    });
  });

  describe('save and discard buttons', () => {
    it('keeps Save and Discard disabled until there are unsaved changes', () => {
      renderEditable({ onSave: vi.fn(), onDiscard: vi.fn() });

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
    });

    it('enables Save and Discard once there are unsaved changes, and calls them', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onDiscard = vi.fn();
      renderEditable({ hasUnsavedChanges: true, onSave, onDiscard });

      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await user.click(screen.getByRole('button', { name: 'Discard' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('blocks saving while the table is invalid', () => {
      renderEditable({
        hasUnsavedChanges: true,
        isValid: false,
        onSave: vi.fn(),
      });

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
      expect(
        screen.getByText('Please fix validation errors before saving'),
      ).toBeInTheDocument();
    });

    it('shows Saving... while a save is in progress, and Save otherwise', () => {
      const { rerender } = renderEditable({
        hasUnsavedChanges: true,
        onSave: vi.fn(),
      });
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

      rerender(
        <EditableTable
          {...tableProps({
            hasUnsavedChanges: true,
            isSaving: true,
            onSave: vi.fn(),
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });

    it('shows no buttons when the use case provides no save or discard', () => {
      renderEditable({ hasUnsavedChanges: true });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('sortable headers', () => {
    const sortableDisplay: ColumnDisplayConfig[] = [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'detail', label: 'Detail' },
    ];

    it('reports a click on a sortable header to the use case', async () => {
      const user = userEvent.setup();
      const onSortColumn = vi.fn();
      renderEditable({ displayConfig: sortableDisplay, onSortColumn });

      await user.click(screen.getByRole('button', { name: 'Name' }));

      expect(onSortColumn).toHaveBeenCalledExactlyOnceWith('name');
    });

    it('shows the sort it is given without reordering the rows', () => {
      renderEditable({
        displayConfig: sortableDisplay,
        sort: { columnId: 'name', direction: 'descending' },
      });

      expect(
        screen.getByRole('columnheader', { name: 'Name' }),
      ).toHaveAttribute('aria-sort', 'descending');
      // Rows stay in the order the use case supplied: Ana before Luis
      const nameInputs = screen.getAllByLabelText('Name input');
      expect(
        nameInputs.map((input) => (input as HTMLInputElement).value),
      ).toEqual(['Ana', 'Luis']);
    });
  });

  it('shows an error message instead of crashing when a cell fails to render', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    renderEditable({
      renderCell: () => {
        throw new Error('boom');
      },
    });

    expect(
      screen.getByText('Something went wrong with the table.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    consoleError.mockRestore();
  });
});
