import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import StudentCell from './StudentCell';
import mockDataHardCoded from '../../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';
const exampleStudent = {
  recordId: 6746,
  firstName: 'Hunter',
  lastName: 'Derek',
  fullName: 'Hunter Derek',
  email: 'hunter_derek73@aol.com',
  timeZone: '',
  usPhone: '',
  fluencyGoal: 'Talk about the weather and seasonal activities in Spanish.',
  startingLevel: '',
  primaryCoach: {
    email: 'woodward-dorris81@aol.com',
    id: '76457430.uhgh',
    name: 'Woodward Dorris',
  },
};
// Needs membership table & activeStudents table to be mocked
describe('component StudentCell', () => {
  // Write better tests, delete skipped ones
  it.skip('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <StudentCell week={mockDataHardCoded.lastThreeWeeks[0]} />
      </MockAllProviders>,
    );
    // Student Name related to the week record
    await waitFor(() => {
      expect(
        screen.getByText(mockDataHardCoded.activeStudents[0].fullName),
      ).toBeInTheDocument();
    });
  });
});
