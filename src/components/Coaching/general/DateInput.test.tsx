import { fireEvent, render } from '@testing-library/react';
import { act } from 'react';
import { describe, it, vi } from 'vitest';
import DateInput from './DateInput';

describe('component DateInput', () => {
  it('renders a date input', () => {
    const { getByLabelText } = render(
      <DateInput value="2021-01-01" onChange={vi.fn()} />,
    );
    expect(getByLabelText('Date:')).toHaveValue('2021-01-01');
  });

  it('calls the onChange handler when the input value changes', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <DateInput value="2021-01-01" onChange={onChange} />,
    );
    act(() => {
      fireEvent.change(getByLabelText('Date:'), {
        target: { value: '2021-02-01' },
      });
    });
    expect(onChange).toHaveBeenCalledWith('2021-02-01');
  });
});
