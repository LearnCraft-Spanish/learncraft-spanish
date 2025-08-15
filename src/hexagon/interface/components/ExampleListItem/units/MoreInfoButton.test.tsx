import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MoreInfoButton from './MoreInfoButton';

const mockProps = {
  onClickFunction: vi.fn(),
  isOpen: false,
};

describe('component MoreInfoButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Expand button when closed', () => {
    render(<MoreInfoButton {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Expand');
    expect(button).toHaveClass('moreInfo', 'closed');
  });

  it('should render Collapse button when open', () => {
    render(<MoreInfoButton {...mockProps} isOpen={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Collapse');
    expect(button).toHaveClass('moreInfo', 'open');
  });

  it('should call onClickFunction when button is clicked', () => {
    render(<MoreInfoButton {...mockProps} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.onClickFunction).toHaveBeenCalledTimes(1);
  });

  it('should have button type="button"', () => {
    render(<MoreInfoButton {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
