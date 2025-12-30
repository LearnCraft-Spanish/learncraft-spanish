import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { StandardCell } from '@interface/components/EditableTable/cells/StandardCell';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock all cell components
vi.mock('@interface/components/EditableTable/cells', () => ({
  BooleanCell: () => <div>BooleanCell</div>,
  DateCell: () => <div>DateCell</div>,
  MultiSelectCell: () => <div>MultiSelectCell</div>,
  NumberCell: () => <div>NumberCell</div>,
  ReadOnlyCell: () => <div>ReadOnlyCell</div>,
  SelectCell: () => <div>SelectCell</div>,
  TextAreaCell: () => <div>TextAreaCell</div>,
  TextCell: () => <div>TextCell</div>,
}));

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'text',
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {},
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test Field',
    placeholder: 'Enter value',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: 'test value',
    isDirty: false,
    isActive: false,
    isEditable: true,
    onChange: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    cellRef: vi.fn(),
    ...overrides,
  };
}

describe('standardCell', () => {
  describe('column type routing', () => {
    it('should render ReadOnlyCell when column is not editable', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'text',
          editable: false,
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('ReadOnlyCell')).toBeInTheDocument();
    });

    it('should render ReadOnlyCell when column type is readonly', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'read-only',
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('ReadOnlyCell')).toBeInTheDocument();
    });

    it('should render SelectCell when column type is select', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'select',
          options: [{ value: 'opt1', label: 'Option 1' }],
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('SelectCell')).toBeInTheDocument();
    });

    it('should render MultiSelectCell when column type is multiselect', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'multi-select',
          options: [{ value: 'opt1', label: 'Option 1' }],
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('MultiSelectCell')).toBeInTheDocument();
    });

    it('should render TextAreaCell when column type is textarea', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'textarea',
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('TextAreaCell')).toBeInTheDocument();
    });

    it('should render BooleanCell when column type is boolean', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'boolean',
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('BooleanCell')).toBeInTheDocument();
    });

    it('should render DateCell when column type is date', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'date',
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('DateCell')).toBeInTheDocument();
    });

    it('should render NumberCell when column type is number', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'number',
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('NumberCell')).toBeInTheDocument();
    });

    it('should render TextCell as default for unknown column types', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'unknown-type' as any,
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('TextCell')).toBeInTheDocument();
    });

    it('should render TextCell when column type is text', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'text',
        },
      });

      render(<StandardCell {...props} />);

      expect(screen.getByText('TextCell')).toBeInTheDocument();
    });
  });

  describe('error display', () => {
    it('should display error when error is present and cell is active', () => {
      const props = createMockProps({
        error: 'This field is required',
        isActive: true,
      });

      render(<StandardCell {...props} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('This field is required');
    });

    it('should not display error when error is present but cell is not active', () => {
      const props = createMockProps({
        error: 'This field is required',
        isActive: false,
      });

      render(<StandardCell {...props} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should not display error when cell is active but no error', () => {
      const props = createMockProps({
        isActive: true,
      });

      render(<StandardCell {...props} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
