import { QuizAssignmentSelector } from '@interface/components/ExampleAssignerInterface/QuizAssignmentSelector';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('quizAssignmentSelector', () => {
  const defaultProps = {
    selectedQuizGroupId: undefined,
    onQuizGroupIdChange: vi.fn(),
    selectedQuizRecordId: undefined,
    onQuizRecordIdChange: vi.fn(),
    availableQuizzes: undefined,
    quizGroupOptions: [
      { id: 1, name: 'Spanish 101' },
      { id: 2, name: 'Spanish 102' },
    ],
  };

  it('should render quiz selection message', () => {
    render(<QuizAssignmentSelector {...defaultProps} />);

    expect(screen.getByText('Quiz Group:')).toBeInTheDocument();
    expect(screen.getByText('Quiz:')).toBeInTheDocument();
  });

  it('should render quiz group selector', () => {
    render(<QuizAssignmentSelector {...defaultProps} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(screen.getByText('Select a Quiz Group')).toBeInTheDocument();
  });

  it('should call onQuizGroupIdChange when quiz group is selected', () => {
    const onQuizGroupIdChange = vi.fn();
    const onQuizRecordIdChange = vi.fn();

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizRecordIdChange={onQuizRecordIdChange}
      />,
    );

    const selects = screen.getAllByRole('combobox');
    const quizGroupSelect = selects[0];
    fireEvent.change(quizGroupSelect, { target: { value: '1' } });

    expect(onQuizGroupIdChange).toHaveBeenCalledWith(1);
  });

  it('should render quiz selector when quiz group is selected', () => {
    const availableQuizzes = [
      {
        id: 1,
        published: true,
        quizTitle: 'Quiz 1',
        quizNumber: 1,
        relatedQuizGroupId: 1,
      },
      {
        id: 2,
        published: true,
        quizTitle: 'Quiz 2',
        quizNumber: 2,
        relatedQuizGroupId: 1,
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedQuizGroupId={1}
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
        id: 1,
        published: true,
        quizTitle: 'Quiz 1',
        quizNumber: 1,
        relatedQuizGroupId: 1,
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedQuizGroupId={1}
        availableQuizzes={availableQuizzes}
        onQuizRecordIdChange={onQuizRecordIdChange}
      />,
    );

    const selects = screen.getAllByRole('combobox');
    const quizSelect = selects[1];
    fireEvent.change(quizSelect, { target: { value: '1' } });

    expect(onQuizRecordIdChange).toHaveBeenCalledWith(1);
  });

  it('should display quiz title when available', () => {
    const availableQuizzes = [
      {
        id: 1,
        published: true,
        quizTitle: 'Midterm Exam',
        quizNumber: 1,
        relatedQuizGroupId: 1,
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedQuizGroupId={1}
        availableQuizzes={availableQuizzes}
      />,
    );

    expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
  });

  it('should display quiz number when title is not available', () => {
    const availableQuizzes = [
      {
        id: 1,
        published: true,
        quizTitle: undefined,
        quizNumber: 5,
        relatedQuizGroupId: 1,
      },
    ];

    render(
      <QuizAssignmentSelector
        {...defaultProps}
        selectedQuizGroupId={1}
        availableQuizzes={availableQuizzes}
      />,
    );

    expect(screen.getByText('Quiz 5')).toBeInTheDocument();
  });
});
