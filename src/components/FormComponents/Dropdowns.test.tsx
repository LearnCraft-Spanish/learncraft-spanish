import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';
import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
import { CoachDropdown } from './Dropdowns';

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => ({
    coaches: [
      {
        coach_id: 1,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));
describe('dropdowns', () => {
  // describe('component CoachDropdown_LEGACY', () => {
  //   it('renders a coach dropdown', async () => {
  //     const { getByText } = render(
  //       <MockAllProviders>
  //         <DateRangeProvider>
  //           <CoachDropdown_LEGACY coachEmail="" onChange={vi.fn()} editMode />
  //         </DateRangeProvider>
  //       </MockAllProviders>,
  //     );
  //     await waitFor(
  //       () => {
  //         expect(getByText('Coach:')).toBeInTheDocument();
  //       },
  //       { timeout: 10000 },
  //     );
  //   });

  //   it('calls the onChange handler when the input value changes', async () => {
  //     const onChange = vi.fn();
  //     const { getByLabelText } = render(
  //       <MockAllProviders>
  //         <DateRangeProvider>
  //           <CoachDropdown_LEGACY coachEmail="" onChange={onChange} editMode />
  //         </DateRangeProvider>
  //       </MockAllProviders>,
  //     );
  //     const { result } = renderHook(() => useAllCoachesQuery(), {
  //       wrapper: ({ children }) => (
  //         <MockAllProviders>
  //           <DateRangeProvider>{children}</DateRangeProvider>
  //         </MockAllProviders>
  //       ),
  //     });
  //     await waitFor(
  //       () => {
  //         expect(result.current.allCoachesQuery.isSuccess).toBe(true);
  //       },
  //       { timeout: 10000 },
  //     );

  //     await waitFor(() => {
  //       act(() => {
  //         if (result.current.allCoachesQuery?.data?.length === 0)
  //           throw new Error('No data');
  //         fireEvent.change(getByLabelText('Coach:'), {
  //           target: { value: result.current.allCoachesQuery?.data?.[0]?.email },
  //         });
  //       });
  //       expect(onChange).toHaveBeenCalledWith(
  //         result.current.allCoachesQuery?.data?.[0]?.email,
  //       );
  //     });
  //   });

  //   describe('edit mode', () => {
  //     it('renders a p tag when editMode is false', async () => {
  //       const { getByText } = render(
  //         <MockAllProviders>
  //           <DateRangeProvider>
  //             <CoachDropdown_LEGACY
  //               coachEmail=""
  //               onChange={vi.fn()}
  //               editMode={false}
  //             />
  //           </DateRangeProvider>
  //         </MockAllProviders>,
  //       );
  //       await waitFor(() => {
  //         expect(getByText('No Coach Found')).toBeInTheDocument();
  //       });
  //     });
  //   });
  // });

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

    it('calls the onChange handler when the selected coach changes', async () => {
      const onChange = vi.fn();
      render(
        <MockAllProviders>
          <DateRangeProvider>
            <CoachDropdown coachId={0} onChange={onChange} editMode />
          </DateRangeProvider>
        </MockAllProviders>,
      );

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Coach:'), {
          target: { value: '1' },
        });
        expect(onChange).toHaveBeenCalledWith(1);
      });
    });

    describe('edit mode', () => {
      it('renders the coach name as text when editMode is false', async () => {
        render(
          <MockAllProviders>
            <DateRangeProvider>
              <CoachDropdown coachId={1} onChange={vi.fn()} editMode={false} />
            </DateRangeProvider>
          </MockAllProviders>,
        );
        await waitFor(() => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
      });
    });
  });
});
