import { AssignButton } from '@interface/components/ExampleManager/AssignButton';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('assignButton', () => {
  it('should render button text for student assignment', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="students"
        unassignedCount={5}
        isAssigning={false}
        canAssign
        activeStudentName="Test Student"
        quizName={null}
        onClick={onClick}
      />,
    );

    expect(
      screen.getByText('Assign 5 Examples to Test Student'),
    ).toBeInTheDocument();
  });

  it('should render button text for quiz assignment', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="quiz"
        unassignedCount={3}
        isAssigning={false}
        canAssign
        activeStudentName={null}
        quizName="Quiz 1"
        onClick={onClick}
      />,
    );

    expect(
      screen.getByText('Assign 3 Examples to Quiz: Quiz 1'),
    ).toBeInTheDocument();
  });

  it('should show "Assigning..." when isAssigning is true', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="students"
        unassignedCount={5}
        isAssigning
        canAssign
        activeStudentName="Test Student"
        quizName={null}
        onClick={onClick}
      />,
    );

    expect(screen.getByText('Assigning...')).toBeInTheDocument();
  });

  it('should show "Please select a student first" when no student is selected', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="students"
        unassignedCount={5}
        isAssigning={false}
        canAssign={false}
        activeStudentName={null}
        quizName={null}
        onClick={onClick}
      />,
    );

    expect(
      screen.getByText('Please select a student first'),
    ).toBeInTheDocument();
  });

  it('should show "Please select a quiz first" when no quiz is selected', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="quiz"
        unassignedCount={5}
        isAssigning={false}
        canAssign={false}
        activeStudentName={null}
        quizName={null}
        onClick={onClick}
      />,
    );

    expect(screen.getByText('Please select a quiz first')).toBeInTheDocument();
  });

  it('should be disabled when canAssign is false', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="students"
        unassignedCount={5}
        isAssigning={false}
        canAssign={false}
        activeStudentName="Test Student"
        quizName={null}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call onClick when button is clicked and canAssign is true', () => {
    const onClick = vi.fn();

    render(
      <AssignButton
        assignmentType="students"
        unassignedCount={5}
        isAssigning={false}
        canAssign
        activeStudentName="Test Student"
        quizName={null}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
