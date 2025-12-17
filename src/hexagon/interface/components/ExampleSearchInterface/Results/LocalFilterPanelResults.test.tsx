import mockUseCoursesWithLessons from '@application/queries/useCoursesWithLessons.mock';
import { useLocalFilterPanelResults } from '@application/units/ExampleSearchInterface/Results/useLocalFilterPanelResults';
import { LocalFilterPanelResults } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => mockUseCoursesWithLessons,
}));
vi.mock(
  '@application/units/ExampleSearchInterface/Results/useLocalFilterPanelResults',
  () => ({
    useLocalFilterPanelResults: vi.fn(() => ({
      examples: createMockExampleWithVocabularyList(1, {
        spanish: 'Example 1',
      }),
      isLoading: false,
      error: null,
      paginationState: {
        page: 1,
        maxPageNumber: 100,
        nextPage: vi.fn(),
        previousPage: vi.fn(),
      },
    })),
  }),
);

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: vi.fn(() => ({
    addSelectedExample: vi.fn(),
    removeSelectedExample: vi.fn(),
    selectedExampleIds: [],
  })),
}));

describe('component: LocalFilterPanelResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(
      <LocalFilterPanelResults
        skillTags={[] as any}
        excludeSpanglish={false}
        audioOnly={false}
        lessonRanges={[] as any}
      />,
    );

    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('Example 1')).toBeInTheDocument();
  });

  it('uses useLocalFilterPanelResults hook and passes props', () => {
    const skillTags = [{ id: 'skillTag1' }] as any;
    const lessonRanges = [{ start: 1, end: 2 }] as any;
    const excludeSpanglish = true;
    const audioOnly = true;

    render(
      <LocalFilterPanelResults
        skillTags={skillTags}
        excludeSpanglish={excludeSpanglish}
        audioOnly={audioOnly}
        lessonRanges={lessonRanges}
      />,
    );

    expect(useLocalFilterPanelResults).toHaveBeenCalledWith({
      skillTags,
      excludeSpanglish,
      audioOnly,
      lessonRanges,
    });
  });
});
