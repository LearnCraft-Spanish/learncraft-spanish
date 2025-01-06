import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import AssignmentsCell from './AssignmentsCell';

/*
export interface Assignment {
  recordId: number;
  assignmentLink: string;
  relatedWeek: number;
  rating: string;
  assignmentType: string;
  areasOfDifficulty: string;
  notes: string;
  homeworkCorrector: QbUser;
  weekStarts: Date | string;
}
*/
const assignment = {
  assignmentType: 'Pronunciation',
  homeworkCorrector: {
    email: 'josiah@learncraftspanish.com',
    id: '',
    name: 'Josiah Moser',
  },
  assignmentLink: '',
  rating: 'Excellent',
  areasOfDifficulty: '',
  notes: '',
  recordId: 0,
  relatedWeek: 0,
  weekStarts: '2019-07-21',
};
// Needs membership table & activeStudents table to be mocked
describe('component StudentCell', () => {
  it('default view renders without crashing', () => {
    render(
      <MockAllProviders>
        <AssignmentsCell assignment={assignment} />
      </MockAllProviders>,
    );
    // {assignment.assignmentType}:{assignment.rating} of assignment passed in
    expect(
      screen.getByText(`${assignment.assignmentType}:${assignment.rating}`),
    ).toBeInTheDocument();
  });
  it('contextual menu view renders without crashing', async () => {
    render(
      <MockAllProviders>
        <AssignmentsCell assignment={assignment} />
      </MockAllProviders>,
    );
    // Click on the button that opens the contextual menu
    act(() => {
      screen.getByRole('button').click();
    });
    await waitFor(() => {
      // Contextual menu should be open
      expect(screen.getByText('Notes:')).toBeInTheDocument();
    });
  });
});
