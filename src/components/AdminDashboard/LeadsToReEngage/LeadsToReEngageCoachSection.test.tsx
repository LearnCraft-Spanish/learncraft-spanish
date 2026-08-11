import { fireEvent, render, screen } from '@testing-library/react';
import { createMockLeadsToReEngage } from '@testing/factories/adminReportsFactory';
import { describe, expect, it, vi } from 'vitest';
import LeadsToReEngageCoachSection from './LeadsToReEngageCoachSection';

describe('leadsToReEngageCoachSection', () => {
  it('shows the coach name and student count, collapsed by default', () => {
    const coachReport = createMockLeadsToReEngage({
      coach: {
        coach_id: 1,
        fullName: 'Coach Alpha',
        email: 'coach.alpha@example.test',
      },
      students: [
        {
          student_id: 11,
          fullName: 'Student One',
          email: 'one@example.test',
          lastMembershipName: 'Coaching Program',
          lastMembershipEndDate: '2026-01-01',
          onHold: false,
        },
        {
          student_id: 12,
          fullName: 'Student Two',
          email: 'two@example.test',
          lastMembershipName: 'Coaching Program',
          lastMembershipEndDate: '2026-02-01',
          onHold: false,
        },
      ],
    });

    render(
      <LeadsToReEngageCoachSection
        coachReport={coachReport}
        isOpen={false}
        toggleOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('Coach Alpha')).toBeInTheDocument();
    expect(screen.getByText('2 students to re-engage')).toBeInTheDocument();
    expect(screen.queryByText('Student One')).not.toBeInTheDocument();
  });

  it('uses singular wording for a single student', () => {
    const coachReport = createMockLeadsToReEngage({
      coach: {
        coach_id: 2,
        fullName: 'Coach Beta',
        email: 'coach.beta@example.test',
      },
      students: [
        {
          student_id: 21,
          fullName: 'Student Solo',
          email: 'solo@example.test',
          lastMembershipName: 'Coaching Program',
          lastMembershipEndDate: '2026-01-01',
          onHold: false,
        },
      ],
    });

    render(
      <LeadsToReEngageCoachSection
        coachReport={coachReport}
        isOpen={false}
        toggleOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('1 student to re-engage')).toBeInTheDocument();
  });

  it('renders each student as a row with name, email, and their last membership when open', () => {
    const coachReport = createMockLeadsToReEngage({
      coach: {
        coach_id: 3,
        fullName: 'Coach Gamma',
        email: 'coach.gamma@example.test',
      },
      students: [
        {
          student_id: 31,
          fullName: 'Student Three',
          email: 'three@example.test',
          lastMembershipName: 'Two-Month Coaching Fluency',
          lastMembershipEndDate: '2026-03-15',
          onHold: false,
        },
      ],
    });

    render(
      <LeadsToReEngageCoachSection
        coachReport={coachReport}
        isOpen
        toggleOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Last Membership')).toBeInTheDocument();
    expect(screen.getByText('Membership Ended')).toBeInTheDocument();
    expect(screen.getByText('Student Three')).toBeInTheDocument();
    expect(screen.getByText('three@example.test')).toBeInTheDocument();
    expect(screen.getByText('Two-Month Coaching Fluency')).toBeInTheDocument();
    expect(
      screen.getByText(new Date('2026-03-15').toLocaleDateString()),
    ).toBeInTheDocument();
  });

  it('shows "On Hold" instead of an end date when the last membership is on hold', () => {
    const coachReport = createMockLeadsToReEngage({
      coach: {
        coach_id: 6,
        fullName: 'Coach Zeta',
        email: 'coach.zeta@example.test',
      },
      students: [
        {
          student_id: 61,
          fullName: 'Student Paused',
          email: 'paused@example.test',
          lastMembershipName: 'Coaching Program',
          lastMembershipEndDate: '2026-03-15',
          onHold: true,
        },
      ],
    });

    render(
      <LeadsToReEngageCoachSection
        coachReport={coachReport}
        isOpen
        toggleOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('On Hold')).toBeInTheDocument();
    expect(
      screen.queryByText(new Date('2026-03-15').toLocaleDateString()),
    ).not.toBeInTheDocument();
  });

  it('shows "No records found" when the coach has no students and the section is open', () => {
    const coachReport = createMockLeadsToReEngage({
      coach: {
        coach_id: 4,
        fullName: 'Coach Delta',
        email: 'coach.delta@example.test',
      },
      students: [],
    });

    render(
      <LeadsToReEngageCoachSection
        coachReport={coachReport}
        isOpen
        toggleOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('calls toggleOpen when the coach header is clicked', () => {
    const toggleOpen = vi.fn();
    const coachReport = createMockLeadsToReEngage({
      coach: {
        coach_id: 5,
        fullName: 'Coach Epsilon',
        email: 'coach.epsilon@example.test',
      },
      students: [],
    });

    render(
      <LeadsToReEngageCoachSection
        coachReport={coachReport}
        isOpen={false}
        toggleOpen={toggleOpen}
      />,
    );

    fireEvent.click(screen.getByText('Coach Epsilon'));

    expect(toggleOpen).toHaveBeenCalledTimes(1);
  });
});
