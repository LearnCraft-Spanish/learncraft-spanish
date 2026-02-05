import type { ColumnDefinition } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { EditableTableHeader } from '@interface/components/EditableTable/components/EditableTableHeader';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('editableTableHeader', () => {
  const columns: ColumnDefinition[] = [
    {
      id: 'name',
      type: 'read-only',
    },
    {
      id: 'active',
      type: 'boolean',
    },
    {
      id: 'description',
      type: 'textarea',
    },
  ];

  const displayConfig: Record<string, ColumnDisplayConfig> = {
    name: {
      id: 'name',
      label: 'Name',
      width: '200px',
    },
    active: {
      id: 'active',
      label: 'Is Active',
      width: '100px',
    },
    description: {
      id: 'description',
      label: 'Description',
      width: '1fr',
    },
  };

  const getDisplay = (columnId: string) => displayConfig[columnId];

  it('should render all column headers with correct labels', () => {
    render(
      <table>
        <thead>
          <EditableTableHeader columns={columns} getDisplay={getDisplay} />
        </thead>
      </table>,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Is Active')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should apply width styles to columns', () => {
    const { container } = render(
      <table>
        <thead>
          <EditableTableHeader columns={columns} getDisplay={getDisplay} />
        </thead>
      </table>,
    );

    const headers = container.querySelectorAll('th');
    expect(headers[0]).toHaveStyle({ width: '200px' });
    expect(headers[1]).toHaveStyle({ width: '100px' });
    expect(headers[2]).toHaveStyle({ width: '1fr' });
  });

  it('should call getDisplay for each column', () => {
    const mockGetDisplay = vi.fn(getDisplay);

    render(
      <table>
        <thead>
          <EditableTableHeader columns={columns} getDisplay={mockGetDisplay} />
        </thead>
      </table>,
    );

    expect(mockGetDisplay).toHaveBeenCalledTimes(3);
    expect(mockGetDisplay).toHaveBeenCalledWith('name');
    expect(mockGetDisplay).toHaveBeenCalledWith('active');
    expect(mockGetDisplay).toHaveBeenCalledWith('description');
  });
});
