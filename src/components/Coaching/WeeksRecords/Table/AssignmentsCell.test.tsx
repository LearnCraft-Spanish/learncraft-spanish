import { beforeAll, describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import AssignmentsCell from './AssignmentsCell';

import mockData from '../../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';

const assignment = mockData.assignments.find(
  (assignment) => assignment.assignmentLink.length > 0,
);

// We need two validations. the first one
if (!assignment) {
  throw new Error('No assignment with assignmentLink found in mock data');
}
describe('component StudentCell', () => {
  it('default view renders without crashing', () => {
    render(
      <MockAllProviders>
        <AssignmentsCell assignment={assignment} />
      </MockAllProviders>,
    );
    expect(
      screen.getByText(`${assignment.assignmentType}:${assignment.rating}`),
    ).toBeInTheDocument();
  });
  describe('contextual menu view', () => {
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
        expect(screen.getByText('Notes:')).toBeInTheDocument();
      });
    });

    it('contextual menu view renders the correct data', async () => {
      const requiredFields = [
        'Corrected by:',
        'Rating:',
        'Notes:',
        'Areas of Difficulty:',
      ];
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
        requiredFields.forEach((field) => {
          expect(screen.getByText(field)).toBeInTheDocument();
        });
      });
    });

    it('contextual menu view renders the session documents if they exist on the assignment', async () => {
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
        expect(screen.getByText('Session Documents:')).toBeInTheDocument();
      });
    });
  });
});
