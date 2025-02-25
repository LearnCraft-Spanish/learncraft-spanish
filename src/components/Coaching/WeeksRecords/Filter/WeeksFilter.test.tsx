import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { describe, expect, it, vi } from 'vitest';
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
    // Unable to test this PROPERLY, these items are always in the document, just not displayed when advancedFilteringMenu is false.
    // This is so that the css transition is smooth, otherwise it would snap open/closed

    it('when advancedFilteringMenu is false, advanced filtering menu is hidden', async () => {
      render(
        <MockAllProviders>
          <WeeksFilter {...defaultProps} advancedFilteringMenu={false} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('More Filters')).toBeInTheDocument();
        // expect(
        //   screen.queryByText(/Exclude Students Without Coaches:/),
        // ).toBeNull();
        // expect(screen.queryByText(/Exclude Weeks on Hold:/)).toBeNull();
        // expect(screen.queryByText(/Filter Records By Completion:/)).toBeNull();
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

  describe('onChange functions', () => {
    const dropdowns = [
      { labelText: 'Week', value: '-1', onChange: 'updateWeeksAgoFilter' },
      {
        labelText: 'Filter Records By Completion',
        value: 'allRecords',
        onChange: 'updateFilterByCompletion',
      },
      //Missing search bar
    ];
    const toggles = [
      {
        labelText: 'Exclude Students Without Coaches',
        value: false,
        onChange: 'updateCoachlessFilter',
        valueLabel: 'filterCoachless',
      },
      {
        labelText: 'Exclude Weeks on Hold',
        value: false,
        onChange: 'updateFilterHoldWeeks',
        valueLabel: 'filterHoldWeeks',
      },
    ];
    dropdowns.forEach((dropdown) => {
      it(`when dropdown ${dropdown.labelText} value changed to ${dropdown.value}`, async () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(
          <MockAllProviders>
            <WeeksFilter
              {...defaultProps}
              {...{ [dropdown.onChange]: onChange }}
            />
          </MockAllProviders>,
        );
        await waitFor(() => {
          fireEvent.change(getByLabelText(`${dropdown.labelText}:`), {
            target: { value: dropdown.value },
          });
        });
        expect(onChange).toHaveBeenCalledWith(dropdown.value);
      });
    });

    toggles.forEach((toggle) => {
      it(`when toggle ${toggle.labelText} value changed to ${toggle.value}`, async () => {
        const onChange = vi.fn();
        const { getByAltText } = render(
          <MockAllProviders>
            <WeeksFilter
              {...defaultProps}
              {...{ [toggle.valueLabel]: true }}
              {...{ [toggle.onChange]: onChange }}
            />
          </MockAllProviders>,
        );
        await waitFor(() => {
          fireEvent.click(getByAltText(`${toggle.labelText}`));
        });
        expect(onChange).toHaveBeenCalledWith(toggle.value);
      });
    });
    describe('weeks Ago Filter calls onChange function with correct values', () => {
      const values = [0, 1, 2, -1];
      values.forEach((value) => {
        it(`when value is ${value}`, async () => {
          const updateWeeksAgoFilter = vi.fn();
          const { getByLabelText } = render(
            <MockAllProviders>
              <WeeksFilter
                {...defaultProps}
                updateWeeksAgoFilter={updateWeeksAgoFilter}
              />
            </MockAllProviders>,
          );
          await waitFor(() => {
            fireEvent.change(getByLabelText('Week:'), {
              target: { value: value.toString() },
            });
          });
          expect(updateWeeksAgoFilter).toHaveBeenCalledWith(value.toString());
        });
      });
    });

    describe('filter records by completion calls onChange function with correct values', () => {
      const values = ['incompleteOnly', 'completeOnly', 'allRecords'];
      values.forEach((value) => {
        it(`when value is ${value}`, async () => {
          const updateFilterByCompletion = vi.fn();
          const { getByLabelText } = render(
            <MockAllProviders>
              <WeeksFilter
                {...defaultProps}
                updateFilterByCompletion={updateFilterByCompletion}
              />
            </MockAllProviders>,
          );
          await waitFor(() => {
            fireEvent.change(getByLabelText('Filter Records By Completion:'), {
              target: { value },
            });
          });
          expect(updateFilterByCompletion).toHaveBeenCalledWith(value);
        });
      });
    });
  });
});
