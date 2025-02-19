import { describe, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react';

import { LinkInput, TextAreaInput, TextInput } from './TextInput';

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

describe('component TextAreaInput', () => {
  it('renders a label and a text area input', () => {
    const { getByLabelText } = render(
      <TextAreaInput
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
      <TextAreaInput
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

  it('edit mode is false, renders value as a paragraph', () => {
    const { getByText } = render(
      <TextAreaInput
        label="Test Label"
        value="Test Value"
        onChange={() => {}}
        editMode={false}
      />,
    );

    expect(getByText('Test Value')).toBeInTheDocument();
  });
});

describe('component LinkInput', () => {
  it('renders a label and a text input', () => {
    const { getByLabelText } = render(
      <LinkInput
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
      <LinkInput
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
  it('when value is a link, renders an anchor tag', () => {
    const { getByText } = render(
      <LinkInput
        label="Test Label"
        value="http://www.google.com"
        onChange={() => {}}
        editMode={false}
      />,
    );

    expect(getByText('Test Label')).toHaveAttribute(
      'href',
      'http://www.google.com',
    );
  });
  it('when value is not a link, renders the value', () => {
    const { getByText } = render(
      <LinkInput
        label="Test Label"
        value="Test Value"
        onChange={() => {}}
        editMode={false}
      />,
    );

    expect(getByText('Test Value')).toBeInTheDocument();
  });
});
