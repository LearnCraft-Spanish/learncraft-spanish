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
      // Return different quiz options based on quizGroupId
      const quizOptionsByGroupId: Record<
        number,
        Array<{
          id: number;
          quizNumber: number;
          quizTitle: string;
          published: boolean;
          relatedQuizGroupId: number;
        }>
      > = {
        1: [
          {
            id: 1,
            quizNumber: 1,
            quizTitle: 'LCSP - Lesson 1',
            published: true,
            relatedQuizGroupId: 1,
          },
          {
            id: 2,
            quizNumber: 2,
            quizTitle: 'LCSP - Lesson 2',
            published: true,
            relatedQuizGroupId: 1,
          },
          {
            id: 3,
            quizNumber: 3,
            quizTitle: 'LCSP - Lesson 3',
            published: true,
            relatedQuizGroupId: 1,
          },
        ],
        2: [
          {
            id: 101,
            quizNumber: 1,
            quizTitle: 'LCSPX - Advanced Lesson 1',
            published: true,
            relatedQuizGroupId: 2,
          },
          {
            id: 102,
            quizNumber: 2,
            quizTitle: 'LCSPX - Advanced Lesson 2',
            published: true,
            relatedQuizGroupId: 2,
          },
        ],
      };
      return {
        quizOptions:
          props.quizGroupId !== undefined
            ? quizOptionsByGroupId[props.quizGroupId] || []
            : [],
        isLoading: false,
        error: null,
      };
    }),
  }),
);

vi.mock('@application/queries/useAllQuizGroups', () => ({
  useAllQuizGroups: vi.fn(() => ({
    quizGroups: mockQuizGroups,
    isLoading: false,
    error: null,
  })),
}));

describe('component: SearchByQuiz', () => {
  it('should render with initial values', async () => {
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={mockQuizGroups[0].id}
        quizId={mockQuizGroups[0].quizzes[0].id}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    const courseSelect = screen.getByLabelText('Course:') as HTMLSelectElement;
    const quizSelect = screen.getByLabelText('Quiz:') as HTMLSelectElement;

    await waitFor(() => {
      expect(courseSelect.value).toBe(mockQuizGroups[0].id.toString());
      expect(quizSelect.value).toBe(mockQuizGroups[0].quizzes[0].id.toString());
    });
  });

  it('should display course options', () => {
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={undefined}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    expect(screen.getAllByText(mockQuizGroups[0].name)).toHaveLength(1);
    expect(screen.getAllByText(mockQuizGroups[1].name)).toHaveLength(1);
  });

  it('should call onQuizGroupIdChange when course is selected', async () => {
    const user = userEvent.setup();
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={undefined}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    const courseSelect = screen.getByLabelText('Course:') as HTMLSelectElement;
    await user.selectOptions(courseSelect, [mockQuizGroups[0].id.toString()]);

    expect(onQuizGroupIdChange).toHaveBeenCalledWith(mockQuizGroups[0].id);
  });

  it('should reset quiz id when quiz group changes', async () => {
    const user = userEvent.setup();
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={undefined}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    const courseSelect = screen.getByLabelText('Course:') as HTMLSelectElement;
    await user.selectOptions(courseSelect, [mockQuizGroups[0].id.toString()]);

    expect(onQuizGroupIdChange).toHaveBeenCalledWith(mockQuizGroups[0].id);
  });

  it('should display quiz options based on selected course', async () => {
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={1}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    expect(screen.getByText('LCSP - Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('LCSP - Lesson 2')).toBeInTheDocument();
    expect(screen.getByText('LCSP - Lesson 3')).toBeInTheDocument();
  });

  it('should call onQuizIdChange when quiz is selected', async () => {
    const user = userEvent.setup();
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={1}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    const quizSelect = screen.getByLabelText('Quiz:') as HTMLSelectElement;
    await user.selectOptions(quizSelect, ['2']);

    expect(onQuizIdChange).toHaveBeenCalledWith(2);
  });

  it('should display selected quiz id value', () => {
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={1}
        quizId={2}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    const quizSelect = screen.getByLabelText('Quiz:') as HTMLSelectElement;
    expect(quizSelect.value).toBe('2');
  });

  it('should display different quiz options when course changes', async () => {
    const onQuizGroupIdChange = vi.fn();
    const onQuizIdChange = vi.fn();

    const { rerender } = render(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={1}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
      { wrapper: MockAllProviders },
    );

    expect(screen.getByText('LCSP - Lesson 3')).toBeInTheDocument();

    rerender(
      <SearchByQuiz
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        quizGroupId={2}
        quizId={undefined}
        onQuizGroupIdChange={onQuizGroupIdChange}
        onQuizIdChange={onQuizIdChange}
      />,
    );

    expect(screen.queryByText('LCSP - Lesson 3')).not.toBeInTheDocument();
    expect(screen.getByText('LCSPX - Advanced Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('LCSPX - Advanced Lesson 2')).toBeInTheDocument();
  });
});
