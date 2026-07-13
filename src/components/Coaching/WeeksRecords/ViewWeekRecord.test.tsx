import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ViewWeekRecord from './ViewWeekRecord';

const weekWithStudent = {
  weekId: 1,
  student: {
    student_id: 1,
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
  },
} as unknown as FurnishedWeekWithCoach;

const weekWithoutStudent = {
  weekId: 1,
} as unknown as FurnishedWeekWithCoach;

describe('component ViewWeekRecord', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an error message when the week is undefined', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    render(<ViewWeekRecord week={undefined} />);
    expect(
      screen.getByText('Week record is undefined, please try again'),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith('Week record is undefined');
  });

  it('renders an error message when the student is undefined', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    render(<ViewWeekRecord week={weekWithoutStudent} />);
    expect(
      screen.getByText('Student record is undefined, please try again'),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith('Student record is undefined');
  });

  it('renders without an error message for a valid week', () => {
    render(<ViewWeekRecord week={weekWithStudent} />);
    expect(
      screen.queryByText('Week record is undefined, please try again'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Student record is undefined, please try again'),
    ).not.toBeInTheDocument();
  });
});
