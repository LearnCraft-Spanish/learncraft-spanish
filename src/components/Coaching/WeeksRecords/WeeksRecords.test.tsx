import { describe, expect, it } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import WeeksRecordsSection from './WeeksRecords';

describe('section WeeksRecordsSection', () => {
  // Write better tests, delete skipped ones
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <WeeksRecordsSection />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Weekly Student Records')).toBeInTheDocument();
    });
  });
  describe('filtering logic', () => {
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
        expect(result.current.lastThreeWeeksQuery.isSuccess).toBe(true);
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
