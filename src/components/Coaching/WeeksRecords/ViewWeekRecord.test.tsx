import { render, screen, waitFor } from '@testing-library/react';
import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

import getDateRange from '../general/functions/dateRange';
import getWeekEnds from '../general/functions/getWeekEnds';

import { DateRangeProvider } from './DateRangeProvider';
import ViewWeekRecord from './ViewWeekRecord';

// Get the default date range
const dateRange = getDateRange();
const defaultStartDate =
  Number.parseInt(dateRange.dayOfWeekString) >= 3
    ? dateRange.thisWeekDate
    : dateRange.lastSundayDate;

// Find a week that falls within the default date range
const week = generatedMockData.weeks.find((w) => {
  const weekDate = new Date(w.weekStarts);
  return (
    weekDate >= new Date(defaultStartDate) &&
    weekDate < new Date(getWeekEnds(defaultStartDate))
  );
});

if (!week) {
  throw new Error(
    'No week found within the default date range. Please update the mock data.',
  );
}

describe.skip('component ViewWeekRecord', () => {
  // Write better tests, delete skipped ones
  it('renders with valid data', async () => {
    render(
      <MockAllProviders>
        <DateRangeProvider>
          <ViewWeekRecord week={week} />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(
      () => {
        expect(screen.getByText('Student:')).toBeInTheDocument();
      },
      { timeout: 7500 },
    );
  });
  it('throws an error with invalid data', async () => {
    const consoleError = vi.spyOn(console, 'error');
    render(
      <MockAllProviders>
        <DateRangeProvider>
          <ViewWeekRecord week={undefined} />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(consoleError).toBeCalled();
    });
  });
  it('renders with the correct data', async () => {
    const requiredFields = [
      'Student:',
      'Email:',
      'Time Zone:',
      'Primary Coach:',
      'Fluency Goal:',
      'Starting Level:',
      'Week #:',
      'Current Lesson:',
    ];
    render(
      <MockAllProviders>
        <DateRangeProvider>
          <ViewWeekRecord week={week} />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(() => {
      requiredFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
    });
  });
});
