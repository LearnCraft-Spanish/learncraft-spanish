import { render, renderHook, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { describe, expect, it } from 'vitest';
import WeeksRecordsSection from './WeeksRecords';

describe('section WeeksRecordsSection', () => {
  // Write better tests, delete skipped ones
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <WeeksRecordsSection />
      </MockAllProviders>,
    );
    await waitFor(
      () => {
        expect(screen.getByText('Weekly Student Records')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });
  describe.skip('filtering logic', () => {
    /*
    tests: 
    - default values are correct
    - changing any filter updates the list
      - [Coach, Course, Week, Search Bar, Coachless, on hold, completion]
    - specific filters have multiple filtering options
      - Week (this, last, two ago, all), completion (incomplete, complete, all)

    */
    it('default filters: filterHoldWeek is True, filterByCompletion is incompleteOnly', async () => {
      render(
        <MockAllProviders>
          <WeeksRecordsSection />
        </MockAllProviders>,
      );
      const { result } = renderHook(() => useCoaching(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() => {
        expect(screen.getByText('Weekly Student Records')).toBeInTheDocument();
        expect(result.current.weeksQuery.isSuccess).toBe(true);
      });
      // check defaults
      expect(screen.getByLabelText('Week:')).toHaveValue('1'); //Filter By Last Week
      // exclude weeks on hold to be checked
      // filterByCompletion to be incompleteOnly
      // filter out coachless to be checked

      // basic check becuase I dont want to rewrite the filter component right now
      expect(screen.getByText('Showing 1 record')).toBeInTheDocument();
    });
  });
});
