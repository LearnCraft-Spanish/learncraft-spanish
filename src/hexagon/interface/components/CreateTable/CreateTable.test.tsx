import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { CreateTable } from '@interface/components/CreateTable/CreateTable';
import { render, screen } from '@testing-library/react';
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
});
