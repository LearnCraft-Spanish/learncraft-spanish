import TextInput from '@interface/components/FormComponents/TextInput/TextInput';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react';
import { vi } from 'vitest';

describe('component TextInput', () => {
  it('renders a label and a text input', () => {
    const { getByLabelText } = render(
      <TextInput
        label="Test Label"
        value="Test Value"
        onChange={() => {}}
        editMode
      />,
    );

    expect(getByLabelText('Test Label:')).toBeInTheDocument();
    expect(getByLabelText('Test Label:')).toHaveValue('Test Value');
  });
  it('calls the onChange handler when the input value changes', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <TextInput
        label="Test Label"
        value="Test Value"
        onChange={onChange}
        editMode
      />,
    );
    act(() => {
      fireEvent.change(getByLabelText('Test Label:'), {
        target: { value: 'New Value' },
      });
    });
    expect(onChange).toHaveBeenCalledWith('New Value');
  });

  it('edit mode is false, renders a paragraph tag', () => {
    const { getByText } = render(
      <TextInput
        label="Test Label"
        value="Test Value"
        onChange={() => {}}
        editMode={false}
      />,
    );

    expect(getByText('Test Value')).toBeInTheDocument();
  });
});
