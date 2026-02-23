import type { QuizGroup } from '@learncraft-spanish/shared';
import { SearchByQuiz } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

/**
 * Explicitly defined mock quiz groups for testing SearchByQuiz component
 * Includes LCSP and LCSPX courses as referenced in tests
 */
const mockQuizGroups: QuizGroup[] = [
  {
    id: 1,
    name: 'LearnCraft Spanish',
    urlSlug: 'lcsp',
    courseId: 1,
    published: true,
    quizzes: [
      {
        id: 1,
        relatedQuizGroupId: 1,
        quizNumber: 1,
        quizTitle: 'LCSP - Lesson 1',
        published: true,
      },
      {
        id: 2,
        relatedQuizGroupId: 1,
        quizNumber: 2,
        quizTitle: 'LCSP - Lesson 2',
        published: true,
      },
      {
        id: 3,
        relatedQuizGroupId: 1,
        quizNumber: 3,
        quizTitle: 'LCSP - Lesson 3',
        published: true,
      },
      {
        id: 4,
        relatedQuizGroupId: 1,
        quizNumber: 4,
        quizTitle: 'LCSP - Lesson 4',
        published: true,
      },
      {
        id: 5,
        relatedQuizGroupId: 1,
        quizNumber: 5,
        quizTitle: 'LCSP - Lesson 5',
        published: true,
      },
    ],
  },
  {
    id: 2,
    name: 'LearnCraft Spanish Extended',
    urlSlug: 'lcspx',
    courseId: 2,
    published: true,
    quizzes: [
      {
        id: 101,
        relatedQuizGroupId: 2,
        quizNumber: 1,
        quizTitle: 'LCSPX - Advanced Lesson 1',
        published: true,
      },
      {
        id: 102,
        relatedQuizGroupId: 2,
        quizNumber: 2,
        quizTitle: 'LCSPX - Advanced Lesson 2',
        published: true,
      },
      {
        id: 103,
        relatedQuizGroupId: 2,
        quizNumber: 3,
        quizTitle: 'LCSPX - Advanced Lesson 3',
        published: true,
      },
    ],
  },
];

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

vi.mock('@application/queries/useOfficialQuizzesQuery', () => ({
  useOfficialQuizzesQuery: vi.fn(() => ({
    quizGroups: mockQuizGroups,
  })),
}));

describe('component: SearchByQuiz', () => {
  it('should render with initial values', async () => {
    const onCourseCodeChange = vi.fn();
    const onQuizNumberChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        courseCode={mockQuizGroups[0].urlSlug}
        quizNumber={mockQuizGroups[0].quizzes[0].quizNumber}
        onCourseCodeChange={onCourseCodeChange}
        onQuizNumberChange={onQuizNumberChange}
      />,
      { wrapper: MockAllProviders },
    );

    const courseSelect = screen.getByLabelText('Course:') as HTMLSelectElement;

    const quizSelect = screen.getByLabelText('Quiz:') as HTMLSelectElement;

    await waitFor(() => {
      expect(courseSelect.value).toBe(mockQuizGroups[0].urlSlug);
      expect(quizSelect.value).toBe(
        mockQuizGroups[0].quizzes[0].quizNumber.toString(),
      );
    });
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
      { wrapper: MockAllProviders },
    );

    expect(screen.getAllByText(mockQuizGroups[0].name)).toHaveLength(1);
    expect(screen.getAllByText(mockQuizGroups[1].name)).toHaveLength(1);
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
      { wrapper: MockAllProviders },
    );

    const courseSelect = screen.getByLabelText('Course:') as HTMLSelectElement;
    await user.selectOptions(courseSelect, [mockQuizGroups[0].urlSlug]);

    expect(onCourseCodeChange).toHaveBeenCalledWith(mockQuizGroups[0].urlSlug);
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
      { wrapper: MockAllProviders },
    );

    const courseSelect = screen.getByLabelText('Course:') as HTMLSelectElement;
    await user.selectOptions(courseSelect, [mockQuizGroups[0].urlSlug]);

    expect(onCourseCodeChange).toHaveBeenCalledWith(mockQuizGroups[0].urlSlug);
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
      { wrapper: MockAllProviders },
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
      { wrapper: MockAllProviders },
    );

    const quizSelect = screen.getByLabelText('Quiz:') as HTMLSelectElement;
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
      { wrapper: MockAllProviders },
    );

    const quizSelect = screen.getByLabelText('Quiz:') as HTMLSelectElement;
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
      { wrapper: MockAllProviders },
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
