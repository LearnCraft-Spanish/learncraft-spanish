import type { GenericDropdownOption } from '@interface/components/FormComponents/Dropdown/GenericDropdown';
import GenericDropdown from '@interface/components/FormComponents/Dropdown/GenericDropdown';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, it, vi } from 'vitest';

describe('component GenericDropdown', () => {
  const mockOptions: GenericDropdownOption[] = [
    { value: 'option1', text: 'Option 1' },
    { value: 'option2', text: 'Option 2' },
  ];

  it('renders a dropdown', async () => {
    const { getByText } = render(
      <GenericDropdown
        label="Test Label"
        selectedValue=""
        onChange={vi.fn()}
        options={mockOptions}
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
      <GenericDropdown
        label="Test Label"
        selectedValue="option2"
        onChange={vi.fn()}
        options={mockOptions}
        editMode
      />,
    );
    await waitFor(() => {
      expect(getByLabelText('Test Label:')).toHaveValue('option2');
    });
  });

  it('calls the onChange handler when the input value changes', async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <GenericDropdown
        label="Test Label"
        selectedValue=""
        onChange={onChange}
        options={mockOptions}
        editMode
      />,
    );
    await waitFor(() => {
      act(() => {
        fireEvent.change(getByLabelText('Test Label:'), {
          target: { value: 'option2' },
        });
      });
      expect(onChange).toHaveBeenCalledWith('option2');
    });
  });

  it('renders with custom default option text', async () => {
    const { getByText } = render(
      <GenericDropdown
        label="Test Label"
        selectedValue=""
        onChange={vi.fn()}
        options={mockOptions}
        editMode
        defaultOptionText="Choose an option"
      />,
    );
    await waitFor(() => {
      expect(getByText('Choose an option')).toBeInTheDocument();
    });
  });

  it('shows the required class when required is true and in edit mode', async () => {
    const { container } = render(
      <GenericDropdown
        label="Test Label"
        selectedValue=""
        onChange={vi.fn()}
        options={mockOptions}
        editMode
        required
      />,
    );
    await waitFor(() => {
      const label = container.querySelector('label');
      expect(label).toHaveClass('required');
    });
  });

  describe('edit mode', () => {
    it('renders a p tag when editMode is false', async () => {
      const { getByText } = render(
        <GenericDropdown
          label="Test Label"
          selectedValue="option2"
          onChange={vi.fn()}
          options={mockOptions}
          editMode={false}
        />,
      );
      await waitFor(() => {
        expect(getByText('Option 2')).toBeInTheDocument();
      });
    });

    it('renders empty text when no option matches the selected value in non-edit mode', async () => {
      const { container } = render(
        <GenericDropdown
          label="Test Label"
          selectedValue="nonexistent"
          onChange={vi.fn()}
          options={mockOptions}
          editMode={false}
        />,
      );
      await waitFor(() => {
        const content = container.querySelector('.content');
        expect(content?.textContent).toBe('');
      });
    });
  });
});
