import { AssignmentTypeSelector } from '@interface/components/ExampleAssignerInterface/AssignmentTypeSelector';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('assignmentTypeSelector', () => {
  it('should render with student assignment type', () => {
    const onToggle = vi.fn();

    render(
      <AssignmentTypeSelector assignmentType="students" onToggle={onToggle} />,
    );

    expect(screen.getByText('Switch to Quiz Assignment')).toBeInTheDocument();
  });

  it('should render with quiz assignment type', () => {
    const onToggle = vi.fn();

    render(
      <AssignmentTypeSelector assignmentType="quiz" onToggle={onToggle} />,
    );

    expect(
      screen.getByText('Switch to Student Assignment'),
    ).toBeInTheDocument();
  });

  it('should call onToggle when button is clicked', () => {
    const onToggle = vi.fn();

    render(
      <AssignmentTypeSelector assignmentType="students" onToggle={onToggle} />,
    );

    const button = screen.getByText('Switch to Quiz Assignment');
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
