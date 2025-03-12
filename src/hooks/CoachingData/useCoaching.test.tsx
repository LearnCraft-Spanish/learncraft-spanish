import { renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { DateRangeProvider } from 'src/components/Coaching/WeeksRecords/DateRangeProvider';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { describe, expect, it } from 'vitest';

describe('hook useCoaching', () => {
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useCoaching(), {
      wrapper: ({ children }) => (
        <MockAllProviders>
          <DateRangeProvider>{children}</DateRangeProvider>
        </MockAllProviders>
      ),
    });
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });

  describe('queries exist, with data', () => {
    const listOfQueries = [
      'activeMembershipsQuery',
      'activeStudentsQuery',
      'coachListQuery',
      'courseListQuery',
      'weeksQuery',
      'groupSessionsQuery',
      'groupAttendeesQuery',
      'assignmentsQuery',
      'privateCallsQuery',
    ];
    for (const query of listOfQueries) {
      it(`query ${query}: exists and has data`, async () => {
        const { result } = renderHook(() => useCoaching(), {
          wrapper: ({ children }) => (
            <MockAllProviders>
              <DateRangeProvider>{children}</DateRangeProvider>
            </MockAllProviders>
          ),
        });
        await waitFor(() => {
          // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
          expect(result.current[query].isSuccess).toBeTruthy();
          // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
          expect(result.current[query].data.length).toBeGreaterThan(0);
        });
      });
    }
  });
});
