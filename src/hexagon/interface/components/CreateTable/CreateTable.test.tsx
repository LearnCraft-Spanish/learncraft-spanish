import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import { CreateTable } from '@interface/components/CreateTable/CreateTable';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('createTable component', () => {
  const columns: ColumnDefinition[] = [
    { id: 'name', type: 'text' },
    { id: 'age', type: 'number' },
  ];

  const rows: TableRow[] = [
    {
      id: 'row-1',
      cells: {
        name: 'John',
        age: '25',
      },
    },
    {
      id: 'row-2',
      cells: {
        name: 'Jane',
        age: '30',
      },
    },
  ];

  const displayConfig: ColumnDisplayConfig[] = [
    { id: 'name', label: 'Name' },
    { id: 'age', label: 'Age' },
  ];

  const defaultProps = {
    rows,
    columns,
    displayConfig,
    validationErrors: {},
    onCellChange: vi.fn(),
    renderCell: vi.fn(({ value }) => <input value={value} readOnly />),
    activeCell: null,
    setActiveCell: vi.fn(),
    isSaving: false,
    isValid: true,
    hasData: false,
  };

  it('should render table with header and rows', () => {
    render(<CreateTable {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('should call renderCell for each cell', () => {
    const mockRenderCell = vi.fn(({ value }) => (
      <input value={value} readOnly />
    ));

    render(<CreateTable {...defaultProps} renderCell={mockRenderCell} />);

    // 2 rows × 2 columns = 4 cells
    expect(mockRenderCell).toHaveBeenCalledTimes(4);
  });

  it('should pass validation errors to renderCell', () => {
    const mockRenderCell = vi.fn(({ value }) => (
      <input value={value} readOnly />
    ));
    const validationErrors = {
      'row-1': { name: 'Required field' },
    };

    render(
      <CreateTable
        {...defaultProps}
        renderCell={mockRenderCell}
        validationErrors={validationErrors}
      />,
    );

    expect(mockRenderCell).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Required field',
      }),
    );
  });

  it('should render footer when onSave is provided', () => {
    const { container } = render(
      <CreateTable {...defaultProps} onSave={vi.fn()} hasData />,
    );

    expect(container.querySelector('.paste-table__footer')).toBeInTheDocument();
  });

  it('should not render footer when no handlers provided', () => {
    const { container } = render(<CreateTable {...defaultProps} />);

    expect(container.querySelector('.paste-table__footer')).toBeNull();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CreateTable {...defaultProps} className="custom-class" />,
    );

    const tableWrapper = container.querySelector('.paste-table--create');
    expect(tableWrapper).toHaveClass('custom-class');
  });

  it('should pass hasData, isValid, and isSaving to footer', () => {
    render(
      <CreateTable
        {...defaultProps}
        hasData
        isValid={false}
        isSaving={false}
        onSave={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Please fix validation errors before saving'),
    ).toBeInTheDocument();
  });

  it('should pass empty dirtyRowIds set in create mode', () => {
    const mockRenderCell = vi.fn(({ value }) => (
      <input value={value} readOnly />
    ));

    render(<CreateTable {...defaultProps} renderCell={mockRenderCell} />);

    const calls = mockRenderCell.mock.calls;
    calls.forEach((call) => {
      expect(call[0].isDirty).toBe(false);
    });
  });

  /** A real input per cell, wired to every handler the table hands it */
  function renderInput({
    row,
    column,
    value,
    onChange,
    onFocus,
    onBlur,
    cellRef,
  }: CellRenderProps) {
    return (
      <input
        aria-label={`${row.id} ${column.id}`}
        type={column.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={cellRef}
      />
    );
  }

  describe('column headers', () => {
    it('labels a column that has no display config with its id', () => {
      render(
        <CreateTable
          {...defaultProps}
          columns={[...columns, { id: 'nickname', type: 'text' }]}
        />,
      );

      expect(
        screen.getByRole('columnheader', { name: 'nickname' }),
      ).toBeInTheDocument();
    });
  });

  describe('cell events', () => {
    it('reports an edit with the row, the column and the new value', () => {
      const onCellChange = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          onCellChange={onCellChange}
        />,
      );

      fireEvent.change(screen.getByLabelText('row-2 name'), {
        target: { value: 'Janet' },
      });

      expect(onCellChange).toHaveBeenCalledExactlyOnceWith(
        'row-2',
        'name',
        'Janet',
      );
    });

    it('makes a cell active when it gets focus, and tells the use case which one', () => {
      const setActiveCell = vi.fn();
      const setActiveCellInfo = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          setActiveCell={setActiveCell}
          setActiveCellInfo={setActiveCellInfo}
        />,
      );

      fireEvent.focus(screen.getByLabelText('row-2 age'));

      expect(setActiveCell).toHaveBeenCalledExactlyOnceWith({
        rowId: 'row-2',
        columnId: 'age',
      });
      expect(setActiveCellInfo).toHaveBeenCalledExactlyOnceWith('row-2', 'age');
    });

    it('clears the active cell when the active cell loses focus', () => {
      const setActiveCell = vi.fn();
      const clearActiveCellInfo = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          activeCell={{ rowId: 'row-1', columnId: 'name' }}
          setActiveCell={setActiveCell}
          clearActiveCellInfo={clearActiveCellInfo}
        />,
      );

      setActiveCell.mockClear();
      fireEvent.blur(screen.getByLabelText('row-1 name'));

      expect(setActiveCell).toHaveBeenCalledExactlyOnceWith(null);
      expect(clearActiveCellInfo).toHaveBeenCalledOnce();
    });

    it('keeps the active cell when a different cell loses focus', () => {
      const setActiveCell = vi.fn();
      const clearActiveCellInfo = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          activeCell={{ rowId: 'row-1', columnId: 'name' }}
          setActiveCell={setActiveCell}
          clearActiveCellInfo={clearActiveCellInfo}
        />,
      );

      setActiveCell.mockClear();
      clearActiveCellInfo.mockClear();
      fireEvent.blur(screen.getByLabelText('row-2 name'));

      expect(setActiveCell).not.toHaveBeenCalled();
      expect(clearActiveCellInfo).not.toHaveBeenCalled();
    });

    it('still tracks the active cell when the focus-info callbacks are not provided', () => {
      const setActiveCell = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          activeCell={{ rowId: 'row-1', columnId: 'name' }}
          setActiveCell={setActiveCell}
        />,
      );

      setActiveCell.mockClear();
      fireEvent.focus(screen.getByLabelText('row-2 name'));
      fireEvent.blur(screen.getByLabelText('row-1 name'));

      expect(setActiveCell).toHaveBeenNthCalledWith(1, {
        rowId: 'row-2',
        columnId: 'name',
      });
      expect(setActiveCell).toHaveBeenNthCalledWith(2, null);
    });

    it('hands pasted content to onPaste', () => {
      const onPaste = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          onPaste={onPaste}
        />,
      );

      fireEvent.paste(screen.getByLabelText('row-1 name'));

      expect(onPaste).toHaveBeenCalledOnce();
    });
  });

  describe('active cell', () => {
    it('flags only the active cell as active', () => {
      const mockRenderCell = vi.fn(renderInput);
      render(
        <CreateTable
          {...defaultProps}
          renderCell={mockRenderCell}
          activeCell={{ rowId: 'row-2', columnId: 'age' }}
        />,
      );

      const activeCells = mockRenderCell.mock.calls
        .map(([props]) => props)
        .filter((props) => props.isActive)
        .map((props) => [props.row.id, props.column.id]);
      expect(new Set(activeCells)).toEqual(new Set([['row-2', 'age']]));
    });

    it('focuses the active cell when it appears', () => {
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          activeCell={{ rowId: 'row-2', columnId: 'age' }}
        />,
      );

      expect(screen.getByLabelText('row-2 age')).toHaveFocus();
    });

    it('focuses nothing when no cell is active', () => {
      render(<CreateTable {...defaultProps} renderCell={renderInput} />);

      expect(document.body).toHaveFocus();
    });

    it('puts the cursor at the end of a text cell it focuses', () => {
      render(
        <CreateTable
          {...defaultProps}
          renderCell={(props) =>
            renderInput({
              ...props,
              // Start with the cursor at the start, as a fresh input might
              cellRef: (element) => {
                if (
                  element instanceof HTMLInputElement &&
                  element.type === 'text'
                ) {
                  element.setSelectionRange(0, 0);
                }
                props.cellRef(element);
              },
            })
          }
          activeCell={{ rowId: 'row-1', columnId: 'name' }}
        />,
      );

      const input = screen.getByLabelText<HTMLInputElement>('row-1 name');
      expect(input).toHaveFocus();
      expect(input.selectionStart).toBe('John'.length);
      expect(input.selectionEnd).toBe('John'.length);
    });

    it('focuses a number cell without trying to place a cursor in it', () => {
      expect(() =>
        render(
          <CreateTable
            {...defaultProps}
            renderCell={renderInput}
            activeCell={{ rowId: 'row-1', columnId: 'age' }}
          />,
        ),
      ).not.toThrow();

      expect(screen.getByLabelText('row-1 age')).toHaveFocus();
    });
  });

  describe('keyboard navigation', () => {
    const activeName = { rowId: 'row-1', columnId: 'name' };

    it('moves to the same column of the next row on Enter', () => {
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          activeCell={activeName}
        />,
      );

      fireEvent.keyDown(screen.getByLabelText('row-1 name'), { key: 'Enter' });

      expect(screen.getByLabelText('row-2 name')).toHaveFocus();
    });

    it('moves to the next cell on Tab', () => {
      render(
        <CreateTable
          {...defaultProps}
          renderCell={renderInput}
          activeCell={activeName}
        />,
      );

      fireEvent.keyDown(screen.getByLabelText('row-1 name'), { key: 'Tab' });

      expect(screen.getByLabelText('row-1 age')).toHaveFocus();
    });

    it('does not move when no cell is active', () => {
      render(<CreateTable {...defaultProps} renderCell={renderInput} />);

      fireEvent.keyDown(screen.getByLabelText('row-1 name'), { key: 'Enter' });

      expect(document.body).toHaveFocus();
    });
  });

  describe('footer', () => {
    it('saves and resets through the footer buttons', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onReset = vi.fn();
      render(
        <CreateTable
          {...defaultProps}
          hasData
          onSave={onSave}
          onReset={onReset}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

      expect(onSave).toHaveBeenCalledOnce();
      expect(onReset).toHaveBeenCalledOnce();
    });

    it('shows saving while a save is in progress', () => {
      render(
        <CreateTable {...defaultProps} hasData isSaving onSave={vi.fn()} />,
      );

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });
  });
});
