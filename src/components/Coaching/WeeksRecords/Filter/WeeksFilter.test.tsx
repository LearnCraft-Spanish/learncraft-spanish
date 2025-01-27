import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import WeeksFilter from './WeeksFilter';

const defaultProps = {
  dataReady: true,
  advancedFilteringMenu: true,
  toggleAdvancedFilteringMenu: vi.fn(),
  filterByCoach: undefined,
  updateCoachFilter: () => {},
  filterByCourse: undefined,
  updateCourseFilter: () => {},
  filterByWeeksAgo: 1,
  updateWeeksAgoFilter: () => {},
  filterCoachless: undefined,
  updateCoachlessFilter: () => {},
  filterHoldWeeks: undefined,
  updateFilterHoldWeeks: () => {},
  filterByCompletion: 'incompleteOnly',
  updateFilterByCompletion: () => {},
  searchTerm: undefined,
  updateSearchTerm: () => {},
};
describe('component WeeksFilter', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <WeeksFilter {...defaultProps} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });
  });
  describe('advanced filtering menu', () => {
    it('by default, advanced filtering menu is shown', async () => {
      render(
        <MockAllProviders>
          <WeeksFilter {...defaultProps} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('Hide')).toBeInTheDocument();
        expect(
          screen.queryByText(/Exclude Students Without Coaches:/),
        ).toBeInTheDocument();
        expect(
          screen.queryByText(/Exclude Weeks on Hold:/),
        ).toBeInTheDocument();
        expect(
          screen.queryByText(/Filter Records By Completion:/),
        ).toBeInTheDocument();
      });
    });
    it('when advancedFilteringMenu is false, advanced filtering menu is hidden', async () => {
      render(
        <MockAllProviders>
          <WeeksFilter {...defaultProps} advancedFilteringMenu={false} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('More Filters')).toBeInTheDocument();
        expect(
          screen.queryByText(/Exclude Students Without Coaches:/),
        ).toBeNull();
        expect(screen.queryByText(/Exclude Weeks on Hold:/)).toBeNull();
        expect(screen.queryByText(/Filter Records By Completion:/)).toBeNull();
      });
    });
    it('clicking "Hide" calls toggleAdvancedFilteringMenu', async () => {
      const toggleAdvancedFilteringMenu = vi.fn();
      render(
        <MockAllProviders>
          <WeeksFilter
            {...defaultProps}
            toggleAdvancedFilteringMenu={toggleAdvancedFilteringMenu}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        screen.getByText('Hide').click();
      });
      expect(toggleAdvancedFilteringMenu).toHaveBeenCalled();
    });
    it('clicking More Filters calls toggleAdvancedFilteringMenu', async () => {
      const toggleAdvancedFilteringMenu = vi.fn();
      render(
        <MockAllProviders>
          <WeeksFilter
            {...defaultProps}
            toggleAdvancedFilteringMenu={toggleAdvancedFilteringMenu}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        screen.getByText('More Filters').click();
      });
      expect(toggleAdvancedFilteringMenu).toHaveBeenCalled();
    });
  });
});
