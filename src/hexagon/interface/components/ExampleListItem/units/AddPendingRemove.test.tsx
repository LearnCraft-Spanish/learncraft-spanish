import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AddPendingRemove from './AddPendingRemove';

const mockProps = {
  isCollected: false,
  isAdding: false,
  isRemoving: false,
  handleAdd: vi.fn(),
  handleRemove: vi.fn(),
};

describe('component AddPendingRemove', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering states', () => {
    it('should render Add button when not collected and not pending', () => {
      render(<AddPendingRemove {...mockProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Add');
      expect(button).toHaveClass('addButton');
    });

    it('should render Remove button when collected and not pending', () => {
      render(<AddPendingRemove {...mockProps} isCollected={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Remove');
      expect(button).toHaveClass('removeButton');
    });

    it('should render Adding... disabled button when adding', () => {
      render(<AddPendingRemove {...mockProps} isAdding={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Adding...');
      expect(button).toHaveClass('addingButton');
    });

    it('should render Removing... disabled button when removing', () => {
      render(
        <AddPendingRemove
          {...mockProps}
          isCollected={true}
          isRemoving={true}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Removing...');
      expect(button).toHaveClass('removingButton');
    });
  });

  describe('button interactions', () => {
    it('should call handleAdd when Add button is clicked', () => {
      render(<AddPendingRemove {...mockProps} />);

      const button = screen.getByRole('button');
      act(() => {
        fireEvent.click(button);
      });

      expect(mockProps.handleAdd).toHaveBeenCalledTimes(1);
      expect(mockProps.handleRemove).not.toHaveBeenCalled();
    });

    it('should call handleRemove when Remove button is clicked', () => {
      render(<AddPendingRemove {...mockProps} isCollected={true} />);

      const button = screen.getByRole('button');
      act(() => {
        fireEvent.click(button);
      });

      expect(mockProps.handleRemove).toHaveBeenCalledTimes(1);
      expect(mockProps.handleAdd).not.toHaveBeenCalled();
    });

    it('should not call any handlers when clicking disabled Adding button', () => {
      render(<AddPendingRemove {...mockProps} isAdding={true} />);

      const button = screen.getByRole('button');
      act(() => {
        fireEvent.click(button);
      });

      expect(mockProps.handleAdd).not.toHaveBeenCalled();
      expect(mockProps.handleRemove).not.toHaveBeenCalled();
    });

    it('should not call any handlers when clicking disabled Removing button', () => {
      render(
        <AddPendingRemove
          {...mockProps}
          isCollected={true}
          isRemoving={true}
        />,
      );

      const button = screen.getByRole('button');
      act(() => {
        fireEvent.click(button);
      });

      expect(mockProps.handleAdd).not.toHaveBeenCalled();
      expect(mockProps.handleRemove).not.toHaveBeenCalled();
    });
  });

  it('should have button type="button"', () => {
    render(<AddPendingRemove {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
