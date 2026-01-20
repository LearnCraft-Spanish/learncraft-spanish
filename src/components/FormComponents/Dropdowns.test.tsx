import { fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { describe, it, vi } from 'vitest';
import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
import { CoachDropdown } from './Dropdowns';

describe('component CoachDropdown', () => {
  it('renders a coach dropdown', async () => {
    const { getByText } = render(
      <MockAllProviders>
        <DateRangeProvider>
          <CoachDropdown coachEmail="" onChange={vi.fn()} editMode />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(
      () => {
        expect(getByText('Coach:')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
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
      { timeout: 10000 },
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
