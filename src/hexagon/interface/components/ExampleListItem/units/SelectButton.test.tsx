import SelectButton from '@interface/components/ExampleListItem/units/SelectButton';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const mockProps = {
  recordId: 123,
  selectedExampleId: null,
  selectExample: vi.fn(),
};

describe('component SelectButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Select button when not selected', () => {
    render(<SelectButton {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Select');
  });

  it('should render Deselect button when selected', () => {
    render(<SelectButton {...mockProps} selectedExampleId={123} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Deselect');
  });

  it('should call selectExample with recordId when Select button is clicked', () => {
    render(<SelectButton {...mockProps} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.selectExample).toHaveBeenCalledWith(123);
  });

  it('should call selectExample with null when Deselect button is clicked', () => {
    render(<SelectButton {...mockProps} selectedExampleId={123} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(mockProps.selectExample).toHaveBeenCalledWith(null);
  });
});
