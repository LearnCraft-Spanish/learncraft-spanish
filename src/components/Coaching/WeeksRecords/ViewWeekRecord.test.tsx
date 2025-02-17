import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import ViewWeekRecord from './ViewWeekRecord';

const week = generatedMockData.weeks[0];
describe('component ViewWeekRecord', () => {
  // Write better tests, delete skipped ones
  it('renders with valid data', async () => {
    render(
      <MockAllProviders>
        <ViewWeekRecord week={week} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Student:')).toBeInTheDocument();
    });
  });
  it('throws an error with invalid data', async () => {
    const consoleError = vi.spyOn(console, 'error');
    render(
      <MockAllProviders>
        <ViewWeekRecord week={undefined} />
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
        <ViewWeekRecord week={week} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      requiredFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
    });
  });
});
