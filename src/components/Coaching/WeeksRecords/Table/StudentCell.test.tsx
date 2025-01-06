import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import StudentCell from './StudentCell';
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
  it('renders without crashing', () => {
    render(
      <MockAllProviders>
        <StudentCell week={} />
      </MockAllProviders>,
    );
    // Student Name related to the week record
    expect(screen.getByText()).toBeInTheDocument();
  });
});
