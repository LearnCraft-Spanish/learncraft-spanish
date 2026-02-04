import { QuizAssignmentSelector } from '@interface/components/ExampleAssignerInterface/QuizAssignmentSelector';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('quizAssignmentSelector', () => {
  const defaultProps = {
    selectedCourseCode: 'none',
    onCourseCodeChange: vi.fn(),
    selectedQuizRecordId: undefined,
    onQuizRecordIdChange: vi.fn(),
    availableQuizzes: undefined,
    courseOptions: [
      { code: 'SP101', name: 'Spanish 101' },
      { code: 'SP102', name: 'Spanish 102' },
    ],
  };

  it('should render quiz selection message', () => {
    render(<QuizAssignmentSelector {...defaultProps} />);

    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByText('Quiz:')).toBeInTheDocument();
  });

  it('should render course selector', () => {
    render(<QuizAssignmentSelector {...defaultProps} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(screen.getByText('Select a Course')).toBeInTheDocument();
  });

  it('should call onCourseCodeChange when course is selected', () => {
    const onCourseCodeChange = vi.fn();
    const onQuizRecordIdChange = vi.fn();

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        onCourseCodeChange={onCourseCodeChange}
        onQuizRecordIdChange={onQuizRecordIdChange}
      />,
    );

    const selects = screen.getAllByRole('combobox');
    const courseSelect = selects[0];
    fireEvent.change(courseSelect, { target: { value: 'SP101' } });

    expect(onCourseCodeChange).toHaveBeenCalledWith('SP101');
  });

  it('should render quiz selector when course is selected', () => {
    const availableQuizzes = [
      {
        recordId: 1,
        quizNickname: 'Quiz 1',
        quizNumber: 1,
        courseCode: 'SP101',
      },
      {
        recordId: 2,
        quizNickname: 'Quiz 2',
        quizNumber: 2,
        courseCode: 'SP101',
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedCourseCode="SP101"
        availableQuizzes={availableQuizzes}
      />,
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(screen.getByText('Select a Quiz')).toBeInTheDocument();
  });

  it('should call onQuizRecordIdChange when quiz is selected', () => {
    const onQuizRecordIdChange = vi.fn();
    const availableQuizzes = [
      {
        recordId: 1,
        quizNickname: 'Quiz 1',
        quizNumber: 1,
        courseCode: 'SP101',
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedCourseCode="SP101"
        availableQuizzes={availableQuizzes}
        onQuizRecordIdChange={onQuizRecordIdChange}
      />,
    );

    const selects = screen.getAllByRole('combobox');
    const quizSelect = selects[1];
    fireEvent.change(quizSelect, { target: { value: '1' } });

    expect(onQuizRecordIdChange).toHaveBeenCalledWith(1);
  });

  it('should display quiz nickname when available', () => {
    const availableQuizzes = [
      {
        recordId: 1,
        quizNickname: 'Midterm Exam',
        quizNumber: 1,
        courseCode: 'SP101',
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedCourseCode="SP101"
        availableQuizzes={availableQuizzes}
      />,
    );

    expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
  });

  it('should display quiz number when nickname is not available', () => {
    const availableQuizzes = [
      {
        recordId: 1,
        quizNickname: undefined,
        quizNumber: 5,
        courseCode: 'SP101',
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedCourseCode="SP101"
        availableQuizzes={availableQuizzes}
      />,
    );

    expect(screen.getByText('Quiz 5')).toBeInTheDocument();
  });
});
