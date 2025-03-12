import { render, screen, waitFor } from '@testing-library/react';
import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it } from 'vitest';
import { DateRangeProvider } from '../DateRangeProvider';
import StudentCell from './StudentCell';

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
        <DateRangeProvider>
          <StudentCell week={week} student={student} />
        </DateRangeProvider>
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
        <DateRangeProvider>
          <StudentCell week={week} student={null} />
        </DateRangeProvider>
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
        <DateRangeProvider>
          <StudentCell week={week} student={student} />
        </DateRangeProvider>
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
