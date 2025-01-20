import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

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
      expect(screen.getByText('Related Membership:')).toBeInTheDocument();
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
      'Related Membership:',
      'Week #:',
      'Current Lesson Name:',
      'Current Lesson:',
      'Checklist complete?',
      'Notes:',
      'Off Track?',
      'Membership - End Date:',
      'Membership - on Hold',
      'Records Complete?',
      'Records Complete Ref:',
      'Record Completeable?',
      'Membership - Student - Member Until:',
      'Ending this Week?',
      'Combined Key for Uniques:',
      'Number of Group Calls:',
      'Group Call Comments:',
      'Private Call Ratings:',
      'Assignment Ratings:',
      'Number of Calls (private & group):',
      'Bad Record?',
      'Primary Coach (when created):',
      'Hold Week',
      'Membership - Course - has group calls?',
      'Membership - Course - Weekly Private Calls:',
      'Bundle Credits Used:',
      'Membership - Student - Call Credits Remaining:',
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
