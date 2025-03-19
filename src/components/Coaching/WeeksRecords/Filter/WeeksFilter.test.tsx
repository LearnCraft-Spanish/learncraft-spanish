import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

import { DateRangeProvider } from '../DateRangeProvider';
import WeeksFilter from './WeeksFilter';

const defaultProps = {
  dataReady: true,
  filterByCoach: undefined,
  updateCoachFilter: () => {},
  filterByCourse: undefined,
  updateCourseFilter: () => {},
  filterCoachless: undefined,
  updateCoachlessFilter: () => {},
  filterHoldWeeks: undefined,
  updateFilterHoldWeeks: () => {},
  filterByCompletion: 'incompleteOnly',
  updateFilterByCompletion: () => {},
  searchTerm: undefined,
  updateSearchTerm: () => {},
  filterByOneMonthChallenge: undefined,
  updateFilterByOneMonthChallenge: () => {},
};

describe('component WeeksFilter', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <DateRangeProvider>
          <WeeksFilter {...defaultProps} />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Week:')).toBeInTheDocument();
    });
  });

  describe('onChange functions', () => {
    const dropdowns = [
      // { labelText: 'Week', value: '-1', onChange: 'updateWeeksAgoFilter' },
      {
        labelText: 'Filter Records By Completion',
        value: 'allRecords',
        onChange: 'updateFilterByCompletion',
      },
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
            <DateRangeProvider>
              <WeeksFilter
                {...defaultProps}
                {...{ [dropdown.onChange]: onChange }}
              />
            </DateRangeProvider>
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
            <DateRangeProvider>
              <WeeksFilter
                {...defaultProps}
                {...{ [toggle.valueLabel]: true }}
                {...{ [toggle.onChange]: onChange }}
              />
            </DateRangeProvider>
          </MockAllProviders>,
        );
        await waitFor(() => {
          fireEvent.click(getByAltText(`${toggle.labelText}`));
        });
        expect(onChange).toHaveBeenCalledWith(toggle.value);
      });
    });

    describe('filter records by completion calls onChange function with correct values', () => {
      const values = ['incompleteOnly', 'completeOnly', 'allRecords'];
      values.forEach((value) => {
        it(`when value is ${value}`, async () => {
          const updateFilterByCompletion = vi.fn();
          const { getByLabelText } = render(
            <MockAllProviders>
              <DateRangeProvider>
                <WeeksFilter
                  {...defaultProps}
                  updateFilterByCompletion={updateFilterByCompletion}
                />
              </DateRangeProvider>
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
