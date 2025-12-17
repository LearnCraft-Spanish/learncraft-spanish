import { SearchByIds } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('component: SearchByIds', () => {
  it('should display the input value', () => {
    const onInputChange = vi.fn();
    const inputValue = '10, 23, 42';

    render(<SearchByIds input={inputValue} onInputChange={onInputChange} />);

    const input = screen.getByDisplayValue('10, 23, 42') as HTMLInputElement;
    expect(input.value).toBe(inputValue);
  });

  it('should call onInputChange when input changes', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();

    render(<SearchByIds input="" onInputChange={onInputChange} />);

    const input = screen.getByPlaceholderText('e.g. 10, 23, 42');

    const newInput = '10, 23, 42';
    await user.type(input, newInput);

    newInput.split('').forEach((char) => {
      expect(onInputChange).toHaveBeenCalledWith(char);
    });
  });

  it('should display parsed IDs correctly', () => {
    const onInputChange = vi.fn();

    render(<SearchByIds input="10, 23, 42" onInputChange={onInputChange} />);

    expect(screen.getByText('Parsed IDs: 10, 23, 42')).toBeInTheDocument();
  });

  it('should filter out invalid IDs and display remaining valid ones', () => {
    const onInputChange = vi.fn();

    render(
      <SearchByIds
        input="10, abc, 23, -5, 99, 0"
        onInputChange={onInputChange}
      />,
    );

    expect(screen.getByText('Parsed IDs: 10, 23, 99')).toBeInTheDocument();
  });

  it('should trim whitespace from IDs', () => {
    const onInputChange = vi.fn();

    render(
      <SearchByIds
        input="  10  ,  23  ,  42  "
        onInputChange={onInputChange}
      />,
    );

    expect(screen.getByText('Parsed IDs: 10, 23, 42')).toBeInTheDocument();
  });

  it('should display "None" when no valid IDs are parsed', () => {
    const onInputChange = vi.fn();

    render(
      <SearchByIds input="abc, xyz, -5, 0" onInputChange={onInputChange} />,
    );

    expect(screen.getByText('Parsed IDs: None')).toBeInTheDocument();
  });
});
