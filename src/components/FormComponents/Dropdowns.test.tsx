import { fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { useAllCoachesQuery } from 'src/hexagon/application/queries/CoachQueries/useAllCoachesQuery';
import { describe, it, vi } from 'vitest';
import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
import { CoachDropdown, CoachDropdown_LEGACY } from './Dropdowns';

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => ({
    allCoachesQuery: {
      isSuccess: true,
      data: [
        {
          coach_id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
        },
      ],
    },
  }),
}));
describe('dropdowns', () => {
  describe('component CoachDropdown_LEGACY', () => {
    it('renders a coach dropdown', async () => {
      const { getByText } = render(
        <MockAllProviders>
          <DateRangeProvider>
            <CoachDropdown_LEGACY coachEmail="" onChange={vi.fn()} editMode />
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
            <CoachDropdown_LEGACY coachEmail="" onChange={onChange} editMode />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      const { result } = renderHook(() => useAllCoachesQuery(), {
        wrapper: ({ children }) => (
          <MockAllProviders>
            <DateRangeProvider>{children}</DateRangeProvider>
          </MockAllProviders>
        ),
      });
      await waitFor(
        () => {
          expect(result.current.allCoachesQuery.isSuccess).toBe(true);
        },
        { timeout: 10000 },
      );

      await waitFor(() => {
        act(() => {
          if (result.current.allCoachesQuery?.data?.length === 0)
            throw new Error('No data');
          fireEvent.change(getByLabelText('Coach:'), {
            target: { value: result.current.allCoachesQuery?.data?.[0]?.email },
          });
        });
        expect(onChange).toHaveBeenCalledWith(
          result.current.allCoachesQuery?.data?.[0]?.email,
        );
      });
    });

    describe('edit mode', () => {
      it('renders a p tag when editMode is false', async () => {
        const { getByText } = render(
          <MockAllProviders>
            <DateRangeProvider>
              <CoachDropdown_LEGACY
                coachEmail=""
                onChange={vi.fn()}
                editMode={false}
              />
            </DateRangeProvider>
          </MockAllProviders>,
        );
        await waitFor(() => {
          expect(getByText('No Coach Found')).toBeInTheDocument();
        });
      });
    });
  });

  describe('component CoachDropdown', () => {
    it('renders a coach dropdown', async () => {
      const { getByText } = render(
        <MockAllProviders>
          <DateRangeProvider>
            <CoachDropdown coachId={0} onChange={vi.fn()} editMode />
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
            <CoachDropdown coachId={0} onChange={onChange} editMode />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      const { result } = renderHook(() => useAllCoachesQuery(), {
        wrapper: ({ children }) => (
          <MockAllProviders>
            <DateRangeProvider>{children}</DateRangeProvider>
          </MockAllProviders>
        ),
      });
      await waitFor(
        () => {
          expect(result.current.allCoachesQuery.isSuccess).toBe(true);
        },
        { timeout: 10000 },
      );

      await waitFor(() => {
        act(() => {
          if (result.current.allCoachesQuery?.data?.length === 0)
            throw new Error('No data');
          fireEvent.change(getByLabelText('Coach:'), {
            target: {
              value: result.current.allCoachesQuery?.data?.[0]?.coach_id,
            },
          });
        });
        expect(onChange).toHaveBeenCalledWith(
          result.current.allCoachesQuery?.data?.[0]?.coach_id,
        );
      });
    });

    describe('edit mode', () => {
      it('renders a p tag when editMode is false', async () => {
        const { getByText } = render(
          <MockAllProviders>
            <DateRangeProvider>
              <CoachDropdown coachId={0} onChange={vi.fn()} editMode={false} />
            </DateRangeProvider>
          </MockAllProviders>,
        );
        await waitFor(() => {
          expect(getByText('No Coach Found')).toBeInTheDocument();
        });
      });
    });
  });
});
