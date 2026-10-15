import type { ColumnDefinition } from '@domain/PasteTable';
import type { EditableTableHeaderProps } from '@interface/components/EditableTable/components/EditableTableHeader';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { EditableTableHeader } from '@interface/components/EditableTable/components/EditableTableHeader';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('applies the pinned class and style to pinned column headers only', () => {
    const getPinnedCell = (columnId: string) =>
      columnId === 'name'
        ? { className: 'pinnedLeft', style: { left: '0px', width: '200px' } }
        : undefined;

    render(
      <table>
        <thead>
          <EditableTableHeader
            columns={columns}
            getDisplay={getDisplay}
            getPinnedCell={getPinnedCell}
          />
        </thead>
      </table>,
    );

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    expect(nameHeader).toHaveClass('paste-table__column-header', 'pinnedLeft');
    expect(nameHeader).toHaveStyle({ left: '0px', width: '200px' });
    const activeHeader = screen.getByRole('columnheader', {
      name: 'Is Active',
    });
    expect(activeHeader).not.toHaveClass('pinnedLeft');
    expect(activeHeader).toHaveStyle({ width: '100px' });
  });

  describe('sortable columns', () => {
    const sortableDisplay: Record<string, ColumnDisplayConfig> = {
      ...displayConfig,
      name: { ...displayConfig.name, sortable: true },
      active: { ...displayConfig.active, sortable: true },
    };

    function renderSortable(props: Partial<EditableTableHeaderProps> = {}) {
      return render(
        <table>
          <thead>
            <EditableTableHeader
              columns={columns}
              getDisplay={(columnId) => sortableDisplay[columnId]}
              {...props}
            />
          </thead>
        </table>,
      );
    }

    function arrowOf(header: HTMLElement): string | null {
      const svg = header.querySelector('svg');
      const glyph = [...(svg?.classList ?? [])].find(
        (name) => name !== 'tabler-icon' && name.startsWith('tabler-icon-'),
      );
      return glyph?.replace('tabler-icon-', '') ?? null;
    }

    it('makes only sortable headers buttons', () => {
      renderSortable();

      expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Is Active' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Description' }),
      ).not.toBeInTheDocument();
    });

    it('reports which sortable header was clicked, without sorting anything itself', () => {
      const onSortColumn = vi.fn();
      renderSortable({ onSortColumn });

      fireEvent.click(screen.getByRole('button', { name: 'Is Active' }));

      expect(onSortColumn).toHaveBeenCalledExactlyOnceWith('active');
    });

    it.each([
      ['ascending', 'arrow-up'],
      ['descending', 'arrow-down'],
    ] as const)(
      'shows the %s sort on its column with an %s arrow',
      (direction, arrow) => {
        renderSortable({ sort: { columnId: 'name', direction } });

        const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
        expect(nameHeader).toHaveAttribute('aria-sort', direction);
        expect(arrowOf(nameHeader)).toBe(arrow);
      },
    );

    it('hints that the other sortable header can be sorted', () => {
      renderSortable({ sort: { columnId: 'name', direction: 'ascending' } });

      const activeHeader = screen.getByRole('columnheader', {
        name: 'Is Active',
      });
      expect(activeHeader).toHaveAttribute('aria-sort', 'none');
      expect(arrowOf(activeHeader)).toBe('arrows-sort');
    });

    it('gives headers that are not sortable no sort state or icon', () => {
      renderSortable({ sort: { columnId: 'name', direction: 'ascending' } });

      const descriptionHeader = screen.getByRole('columnheader', {
        name: 'Description',
      });
      expect(descriptionHeader).not.toHaveAttribute('aria-sort');
      expect(arrowOf(descriptionHeader)).toBeNull();
    });
  });
});
