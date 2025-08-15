import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BulkAddButton from './BulkAddButton';

const mockProps = {
  id: 123,
  isCollected: false,
  handleSelect: vi.fn(),
  isSelected: false,
  isPending: false,
  handleRemoveSelected: vi.fn(),
};

describe('component BulkAddButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Select button when not collected and not selected', () => {
    render(<BulkAddButton {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Select');
    expect(button).toHaveClass('selectAddButton');
  });

  it('should render Selected button when selected', () => {
    render(<BulkAddButton {...mockProps} isSelected={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Selected');
    expect(button).toHaveClass('selectedAddButton');
  });

  it('should render Owned button when collected', () => {
    render(<BulkAddButton {...mockProps} isCollected={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Owned');
    expect(button).toHaveClass('disabledButton');
  });

  it('should render Adding... when pending and not collected', () => {
    render(<BulkAddButton {...mockProps} isPending={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Adding...');
    expect(button).toHaveClass('pendingButton');
  });

  it('should render Removing... when pending and collected', () => {
    render(
      <BulkAddButton {...mockProps} isCollected={true} isPending={true} />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Removing...');
    expect(button).toHaveClass('pendingButton');
  });

  it('should call handleSelect when Select button is clicked', () => {
    render(<BulkAddButton {...mockProps} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.handleSelect).toHaveBeenCalledTimes(1);
    expect(mockProps.handleRemoveSelected).not.toHaveBeenCalled();
  });

  it('should call handleRemoveSelected when Selected button is clicked', () => {
    render(<BulkAddButton {...mockProps} isSelected={true} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.handleRemoveSelected).toHaveBeenCalledTimes(1);
    expect(mockProps.handleSelect).not.toHaveBeenCalled();
  });
});
