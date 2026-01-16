import Dropdown from '@interface/components/FormComponents/Dropdown/Dropdown';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, it, vi } from 'vitest';

describe('component Dropdown', () => {
  it('renders a dropdown', async () => {
    const { getByText } = render(
      <Dropdown
        label="Test Label"
        value=""
        onChange={vi.fn()}
        options={['Option 1', 'Option 2']}
        editMode
      />,
    );
    await waitFor(() => {
      expect(getByText('Test Label:')).toBeInTheDocument();
      expect(getByText('Select')).toBeInTheDocument();
      expect(getByText('Option 1')).toBeInTheDocument();
      expect(getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('renders a dropdown with a value', async () => {
    const { getByLabelText } = render(
      <Dropdown
        label="Test Label"
        value="Option 2"
        onChange={vi.fn()}
        options={['Option 1', 'Option 2']}
        editMode
      />,
    );
    await waitFor(() => {
      // select dropdown with testLabel, check value
      expect(getByLabelText('Test Label:')).toHaveValue('Option 2');
    });
  });

  it('calls the onChange handler when the input value changes', async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <Dropdown
        label="Test Label"
        value=""
        onChange={onChange}
        options={['Option 1', 'Option 2']}
        editMode
      />,
    );
    await waitFor(() => {
      act(() => {
        fireEvent.change(getByLabelText('Test Label:'), {
          target: { value: 'Option 2' },
        });
      });
      expect(onChange).toHaveBeenCalledWith('Option 2');
    });
  });

  describe('edit mode', () => {
    it('renders a p tag when editMode is false', async () => {
      const { getByText } = render(
        <Dropdown
          label="Test Label"
          value="Option 2"
          onChange={vi.fn()}
          options={['Option 1', 'Option 2']}
          editMode={false}
        />,
      );
      await waitFor(() => {
        expect(getByText('Option 2')).toBeInTheDocument();
      });
    });
  });
});
