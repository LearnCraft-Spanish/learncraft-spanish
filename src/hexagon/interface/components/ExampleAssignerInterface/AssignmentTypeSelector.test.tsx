import { AssignmentTypeSelector } from '@interface/components/ExampleAssignerInterface/AssignmentTypeSelector';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('assignmentTypeSelector', () => {
  it('should render with student assignment type', () => {
    const onTypeChange = vi.fn();

    render(
      <AssignmentTypeSelector
        assignmentType="students"
        onTypeChange={onTypeChange}
      />,
    );

    const studentRadio = screen.getByRole('radio', {
      name: 'Student Assignment',
    });
    expect(studentRadio).toBeChecked();
  });

  it('should render with quiz assignment type', () => {
    const onTypeChange = vi.fn();

    render(
      <AssignmentTypeSelector
        assignmentType="quiz"
        onTypeChange={onTypeChange}
      />,
    );

    const quizRadio = screen.getByRole('radio', { name: 'Quiz Assignment' });
    expect(quizRadio).toBeChecked();
  });

  it('should call onToggle when button is clicked', () => {
    const onTypeChange = vi.fn();

    render(
      <AssignmentTypeSelector
        assignmentType="students"
        onTypeChange={onTypeChange}
      />,
    );

    const quizRadio = screen.getByRole('radio', { name: 'Quiz Assignment' });
    fireEvent.click(quizRadio);

    expect(onTypeChange).toHaveBeenCalledWith('quiz');
  });
});
