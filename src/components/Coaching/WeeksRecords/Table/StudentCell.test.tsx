import type {
  FurnishedWeekWithCoach,
  MinimalCoachingStudent,
} from '@learncraft-spanish/shared';
import { render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it } from 'vitest';
import StudentCell from './StudentCell';

const week = {
  weekId: 1,
  coach: {
    coach_id: 1,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
  srCourseName: 'Level 1',
} as unknown as FurnishedWeekWithCoach;

const student = {
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
} as unknown as MinimalCoachingStudent;

describe('component StudentCell', () => {
  it('renders with valid data', () => {
    render(
      <MockAllProviders>
        <StudentCell week={week} student={student} hiddenFields={[]} />
      </MockAllProviders>,
    );
    expect(screen.getByText(student.fullName)).toBeInTheDocument();
  });

  it('does not render with invalid data', () => {
    render(
      <MockAllProviders>
        <StudentCell week={week} student={null} hiddenFields={[]} />
      </MockAllProviders>,
    );
    expect(screen.queryByText(student.fullName)).not.toBeInTheDocument();
  });

  it('renders the correct student details', () => {
    render(
      <MockAllProviders>
        <StudentCell week={week} student={student} hiddenFields={[]} />
      </MockAllProviders>,
    );
    expect(screen.getByText(student.fullName)).toBeInTheDocument();
    expect(screen.getByText(student.email)).toBeInTheDocument();
    expect(screen.getByText(week.coach.fullName)).toBeInTheDocument();
    expect(screen.getByText(week.srCourseName)).toBeInTheDocument();
  });

  it('hides fields configured by the parent table', () => {
    render(
      <MockAllProviders>
        <StudentCell
          week={week}
          student={student}
          hiddenFields={['primaryCoach', 'level']}
        />
      </MockAllProviders>,
    );
    expect(screen.getByText(student.fullName)).toBeInTheDocument();
    expect(screen.queryByText(week.coach.fullName)).not.toBeInTheDocument();
    expect(screen.queryByText(week.srCourseName)).not.toBeInTheDocument();
  });
});
