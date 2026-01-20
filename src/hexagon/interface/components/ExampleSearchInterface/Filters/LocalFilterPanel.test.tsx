import mockUseCoursesWithLessons from '@application/queries/useCoursesWithLessons.mock';
import { LocalFilterPanel } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import { render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => mockUseCoursesWithLessons,
}));

vi.mock(
  '@application/units/ExampleSearchInterface/Filters/useLocalFilterPanelLogic',
  () => ({
    useLocalFilterPanelLogic: vi.fn((_props: any) => ({
      course: { lessons: [] },
      fromLessons: [],
      toLessons: [],
      getDefaultLessonsForCourse: vi.fn(() => ({
        defaultFromLesson: 1,
        defaultToLesson: 10,
      })),
    })),
  }),
);

describe('component: LocalFilterPanel', () => {
  const defaultProps = {
    excludeSpanglish: false,
    audioOnly: false,
    onExcludeSpanglishChange: vi.fn(),
    onAudioOnlyChange: vi.fn(),
    tagSearchTerm: '',
    tagSuggestions: [],
    onTagSearchTermChange: vi.fn(),
    onAddTag: vi.fn(),
    onRemoveTagFromSuggestions: vi.fn(),
    selectedSkillTags: [],
    onRemoveSkillTag: vi.fn(),
    selectedCourseId: 1,
    fromLessonNumber: 1,
    toLessonNumber: 10,
    onCourseChange: vi.fn(),
    onFromLessonChange: vi.fn(),
    onToLessonChange: vi.fn(),
  };

  it('should render', () => {
    render(
      <MockAllProviders>
        <LocalFilterPanel {...defaultProps} />
      </MockAllProviders>,
    );
    expect(screen.getByText('Course:')).toBeInTheDocument();
  });
});
