import { fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { describe, it, vi } from 'vitest';
import { DateRangeProvider } from '../WeeksRecords/DateRangeProvider';
import Dropdown, { CoachDropdown } from './Dropdowns';

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

describe('component CoachDropdown', () => {
  it('renders a coach dropdown', async () => {
    const { getByText } = render(
      <MockAllProviders>
        <DateRangeProvider>
          <CoachDropdown coachEmail="" onChange={vi.fn()} editMode />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText('Coach:')).toBeInTheDocument();
    });
  });

  it('calls the onChange handler when the input value changes', async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <MockAllProviders>
        <DateRangeProvider>
          <CoachDropdown coachEmail="" onChange={onChange} editMode />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    const { result } = renderHook(() => useCoaching(), {
      wrapper: ({ children }) => (
        <MockAllProviders>
          <DateRangeProvider>{children}</DateRangeProvider>
        </MockAllProviders>
      ),
    });
    await waitFor(
      () => {
        expect(result.current.coachListQuery.isSuccess).toBe(true);
      },
      { timeout: 5000 },
    );

    await waitFor(() => {
      act(() => {
        if (!result.current.coachListQuery.data) throw new Error('No data');
        fireEvent.change(getByLabelText('Coach:'), {
          target: { value: result.current.coachListQuery.data[1].user.email },
        });
      });
      expect(onChange).toHaveBeenCalledWith(
        result.current.coachListQuery.data &&
          result.current.coachListQuery.data[1].user.email,
      );
    });
  });

  describe('edit mode', () => {
    it('renders a p tag when editMode is false', async () => {
      const { getByText } = render(
        <MockAllProviders>
          <DateRangeProvider>
            <CoachDropdown coachEmail="" onChange={vi.fn()} editMode={false} />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(getByText('No Coach Found')).toBeInTheDocument();
      });
    });
  });
});
