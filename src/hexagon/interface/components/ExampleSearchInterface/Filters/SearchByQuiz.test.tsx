import { SearchByQuiz } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock useSearchByQuizFilter hook
vi.mock(
  '@application/units/ExampleSearchInterface/Filters/useSearchByQuizFilter',
  () => ({
    useSearchByQuizFilter: vi.fn((props) => {
      // Return different quiz options based on course code
      const quizOptionsByCode: Record<
        string,
        Array<{ id: number; quizNumber: number; quizTitle: string }>
      > = {
        lcsp: [
          { id: 1, quizNumber: 1, quizTitle: 'lcsp Quiz 1' },
          { id: 2, quizNumber: 2, quizTitle: 'lcsp Quiz 2' },
          { id: 3, quizNumber: 3, quizTitle: 'lcsp Quiz 3' },
        ],
        lcspx: [
          { id: 4, quizNumber: 1, quizTitle: 'lcspx Quiz 1' },
          { id: 5, quizNumber: 2, quizTitle: 'lcspx Quiz 2' },
        ],
      };
      return {
        quizOptions: quizOptionsByCode[props.courseCode] || [],
      };
    }),
  }),
);

describe('component: SearchByQuiz', () => {
  it('should render with initial values', () => {
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode=""
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    const courseSelect = screen.getByLabelText(
      'Select Course',
    ) as HTMLSelectElement;
    const quizSelect = screen.getByLabelText(
      'Select Quiz',
    ) as HTMLSelectElement;

    expect(courseSelect.value).toBe('');
    expect(quizSelect.value).toBe('0');
  });

  it('should display course options', () => {
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode=""
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    expect(screen.getByText('Select a Course')).toBeInTheDocument();
    expect(screen.getByText('LearnCraft Spanish')).toBeInTheDocument();
    expect(screen.getByText('LearnCraft Spanish Extended')).toBeInTheDocument();
  });

  it('should call onCourseCodeChange when course is selected', async () => {
    const user = userEvent.setup();
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode=""
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    const courseSelect = screen.getByLabelText('Select Course');
    await user.selectOptions(courseSelect, ['lcsp']);

    expect(onCourseCodeChange).toHaveBeenCalledWith('lcsp');
  });

  it('should reset quiz number to 0 when course code changes', async () => {
    const user = userEvent.setup();
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode=""
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    const courseSelect = screen.getByLabelText('Select Course');
    await user.selectOptions(courseSelect, ['lcsp']);

    expect(onQuizNumberChange).toHaveBeenCalledWith(0);
  });

  it('should display quiz options based on selected course', async () => {
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode="lcsp"
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    expect(screen.getByText('lcsp Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('lcsp Quiz 2')).toBeInTheDocument();
    expect(screen.getByText('lcsp Quiz 3')).toBeInTheDocument();
  });

  it('should call onQuizNumberChange when quiz is selected', async () => {
    const user = userEvent.setup();
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode="lcsp"
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    const quizSelect = screen.getByLabelText('Select Quiz');
    await user.selectOptions(quizSelect, ['2']);

    expect(onQuizNumberChange).toHaveBeenCalledWith(2);
  });

  it('should display selected quiz number value', () => {
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode="lcsp"
        quizNumber={2}
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    const quizSelect = screen.getByLabelText(
      'Select Quiz',
    ) as HTMLSelectElement;
    expect(quizSelect.value).toBe('2');
  });

  it('should display different quiz options when course changes', async () => {
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    const { rerender } = render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode="lcsp"
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    expect(screen.getByText('lcsp Quiz 3')).toBeInTheDocument();

    rerender(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode="lcspx"
        quizNumber=""
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
    );

    expect(screen.queryByText('lcsp Quiz 3')).not.toBeInTheDocument();
    expect(screen.getByText('lcspx Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('lcspx Quiz 2')).toBeInTheDocument();
  });
});
