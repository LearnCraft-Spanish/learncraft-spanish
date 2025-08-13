import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BulkRemoveButton from './BulkRemoveButton';

const mockProps = {
  id: 123,
  isCollected: false,
  handleSelect: vi.fn(),
  isSelected: false,
  isPending: false,
  handleRemoveSelected: vi.fn(),
};

describe('component BulkRemoveButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Not Owned button when not collected', () => {
    render(<BulkRemoveButton {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Not Owned');
    expect(button).toHaveClass('disabledButton');
  });

  it('should render Select button when collected and not selected', () => {
    render(<BulkRemoveButton {...mockProps} isCollected={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Select');
    expect(button).toHaveClass('selectRemoveButton');
  });

  it('should render Selected button when collected and selected', () => {
    render(
      <BulkRemoveButton {...mockProps} isCollected={true} isSelected={true} />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Selected');
    expect(button).toHaveClass('selectedRemoveButton');
  });

  it('should render Adding... when pending and not collected', () => {
    render(<BulkRemoveButton {...mockProps} isPending={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Adding...');
    expect(button).toHaveClass('pendingButton');
  });

  it('should render Removing... when pending and collected', () => {
    render(
      <BulkRemoveButton {...mockProps} isCollected={true} isPending={true} />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Removing...');
    expect(button).toHaveClass('pendingButton');
  });

  it('should call handleSelect when Select button is clicked', () => {
    render(<BulkRemoveButton {...mockProps} isCollected={true} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.handleSelect).toHaveBeenCalledTimes(1);
    expect(mockProps.handleRemoveSelected).not.toHaveBeenCalled();
  });

  it('should call handleRemoveSelected when Selected button is clicked', () => {
    render(
      <BulkRemoveButton {...mockProps} isCollected={true} isSelected={true} />,
    );

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.handleRemoveSelected).toHaveBeenCalledTimes(1);
    expect(mockProps.handleSelect).not.toHaveBeenCalled();
  });
});
