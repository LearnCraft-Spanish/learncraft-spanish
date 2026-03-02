import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { FilterPanel } from '@interface/components/Filters/FilterPanel';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
function renderFilterPanel() {
  return render(
    <ContextualMenuProvider>
      <FilterPanel requireAudioOnly={false} requireNoSpanglish={false} />
    </ContextualMenuProvider>,
  );
}

const mockUseAuthAdapter = vi.fn();
const mockUseCombinedFilters = vi.fn();

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: () => mockUseAuthAdapter(),
}));

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: (props: unknown) => mockUseCombinedFilters(props),
}));

vi.mock('@interface/components/LessonSelector/LessonRangeSelector', () => ({
  default: () => <div data-testid="lesson-range-selector" />,
}));

vi.mock('@interface/components/Filters/PresetSelector', () => ({
  default: () => <div data-testid="preset-selector" />,
}));

const defaultCombinedFilters: UseCombinedFiltersReturnType = {
  isAdmin: false,
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    includeUnpublished: false,
  },
  isLoading: false,
  error: null,
  filterStateWithoutLesson: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTagKeys: [],
    includeUnpublished: false,
  },
  batchUpdateFilterStateWithoutLesson: vi.fn(),
  audioOnly: false,
  updateAudioOnly: vi.fn(),
  excludeSpanglish: false,
  updateExcludeSpanglish: vi.fn(),
  includeUnpublished: false,
  updateIncludeUnpublished: vi.fn(),
  selectedSkillTags: [],
  addSkillTagToFilters: vi.fn(),
  removeSkillTagFromFilters: vi.fn(),
  bulkUpdateSkillTagKeys: vi.fn(),
  course: null,
  courseId: null,
  updateUserSelectedCourseId: vi.fn(),
  fromLesson: null,
  fromLessonNumber: null,
  updateFromLessonNumber: vi.fn(),
  toLesson: null,
  toLessonNumber: null,
  updateToLessonNumber: vi.fn(),
  skillTagSearch: {
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm: vi.fn(),
    removeTagFromSuggestions: vi.fn(),
    addTagBackToSuggestions: vi.fn(),
    isLoading: false,
    error: null,
  },
  filterPreset: PreSetQuizPreset.None,
  setFilterPreset: vi.fn(),
};

describe('filterPanel', () => {
  beforeEach(() => {
    mockUseCombinedFilters.mockReturnValue(defaultCombinedFilters);
  });

  it('does not show Include unpublished toggle when user is not admin', () => {
    renderFilterPanel();
    expect(
      screen.queryByText(/Include unpublished courses and lessons/i),
    ).not.toBeInTheDocument();
  });

  it('shows Include unpublished toggle when user is admin', () => {
    mockUseCombinedFilters.mockReturnValue({
      ...defaultCombinedFilters,
      isAdmin: true,
    });
    renderFilterPanel();
    expect(
      screen.getByText(/Include unpublished courses and lessons/i),
    ).toBeInTheDocument();
  });

  it('calls updateIncludeUnpublished when admin toggles Include unpublished', () => {
    const updateIncludeUnpublished = vi.fn();
    mockUseCombinedFilters.mockReturnValue({
      ...defaultCombinedFilters,
      includeUnpublished: false,
      updateIncludeUnpublished,
      isAdmin: true,
    });

    renderFilterPanel();
    const checkbox = screen.getByRole('checkbox', {
      name: 'includeUnpublished',
    });
    fireEvent.click(checkbox);

    expect(updateIncludeUnpublished).toHaveBeenCalledWith(true);
  });
});
