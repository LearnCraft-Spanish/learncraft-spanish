import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import StudentCell from './StudentCell';
import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';

const week = generatedMockData.weeks[0];
const membership = generatedMockData.memberships.find((membership) => {
  return membership.recordId === week.relatedMembership;
});
if (!membership) {
  throw new Error('No membership related to week record');
}
const student = generatedMockData.studentList.find((student) => {
  return student.recordId === membership.relatedStudent;
});

if (!student) {
  throw new Error('No student related to week record');
}
// Needs membership table & activeStudents table to be mocked
describe('component StudentCell', () => {
  // Write better tests, delete skipped ones
  it('renders with valid data', async () => {
    render(
      <MockAllProviders>
        <StudentCell week={week} />
      </MockAllProviders>,
    );
    // Student Name related to the week record
    await waitFor(() => {
      expect(screen.getByText(student.fullName)).toBeInTheDocument();
    });
  });
  it('does not render with invalid data', async () => {
    render(
      <MockAllProviders>
        <StudentCell
          week={{
            ...week,
            relatedMembership: 777777,
          }}
        />
      </MockAllProviders>,
    );
    // Student Name related to the week record
    await waitFor(() => {
      expect(screen.queryByText(student.fullName)).not.toBeInTheDocument();
    });
  });

  it('renders with the correct data', async () => {
    render(
      <MockAllProviders>
        <StudentCell week={week} />
      </MockAllProviders>,
    );
    // Student Name related to the week record
    await waitFor(() => {
      expect(screen.getByText(student.fullName)).toBeInTheDocument();
      expect(screen.getByText(student.email)).toBeInTheDocument();
      expect(screen.getByText(student.primaryCoach.name)).toBeInTheDocument();
      expect(screen.getByText(week.level)).toBeInTheDocument();
    });
  });

  it.skip('contextual menu', () => {
    // Unable to test here, as the contextual menu is not part of the StudentCell component
    // (it lives in the parent component)
  });
});
