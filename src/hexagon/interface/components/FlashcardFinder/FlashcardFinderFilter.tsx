import type { UseExampleFilterCoordinatorReturnType } from 'src/hexagon/application/coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from 'src/hexagon/application/units/useSkillTagSearch';

import useExampleFilter from 'src/hexagon/application/units/useExampleFilter';
import { SectionHeader } from '../general';
import ToggleSwitch from '../general/ToggleSwitch';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';
import ReadOnlyFilters from './units/ReadOnlyFilters';
import SelectedTags from './VocabTagFilter/SelectedTags';
import TagFilter from './VocabTagFilter/TagFilter';
import 'src/App.css';

export default function FlashcardFinderFilter({
  filterState: hookFilterState,
  skillTagSearch,
}: {
  filterState: UseExampleFilterCoordinatorReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;
}) {
  const { skillTags } = useExampleFilter();

  const {
    filterState,
    filtersChanging,

    updateIncludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    updateFiltersChanging,
  } = hookFilterState;

  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
  } = skillTagSearch;

  // const { exampleFilters, course, fromLesson, toLesson } = filterState;
  const { exampleFilters } = filterState;

  const { includeSpanglish, audioOnly } = exampleFilters;

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div>
      <SectionHeader
        title="Flashcard Finder Filters"
        isOpen={filtersChanging}
        openFunction={() => updateFiltersChanging(!filtersChanging)}
        afterTitleComponents={
          !filtersChanging
            ? [
                <ReadOnlyFilters
                  key="readOnlyFilters"
                  includeSpanglish={includeSpanglish}
                  audioOnly={audioOnly}
                  skillTags={skillTags}
                />,
              ]
            : []
        }
        button={
          filtersChanging && (
            <div className="getExamplesButtonWrapper">
              <button
                onClick={() => updateFiltersChanging(false)}
                type="button"
                className="getExamplesButton"
                disabled={!filtersChanging}
              >
                Get Examples
              </button>
            </div>
          )
        }
      />
      {filtersChanging && (
        <div className="filterSection">
          <div className="filterBox options">
            <div className="FromToLessonSelectorWrapper">
              <LessonRangeSelector />
            </div>
            <ToggleSwitch
              id="removeSpanglish"
              ariaLabel="noSpanglish"
              label="Include Spanglish: "
              checked={includeSpanglish}
              onChange={() =>
                updateIncludeSpanglish(
                  !filterState.exampleFilters.includeSpanglish,
                )
              }
            />
            <ToggleSwitch
              id="audioOnly"
              ariaLabel="audioOnly"
              label="Audio Flashcards Only: "
              checked={audioOnly}
              onChange={() =>
                updateAudioOnly(!filterState.exampleFilters.audioOnly)
              }
            />
          </div>
          <div className="filterBox search">
            <div className="searchFilter">
              <TagFilter
                searchTerm={tagSearchTerm}
                updateSearchTerm={updateTagSearchTerm}
                searchResults={tagSuggestions}
                addTag={addSkillTagToFilters}
                removeTagFromSuggestions={removeTagFromSuggestions}
              />
              <SelectedTags
                removeTag={removeSkillTagFromFilters}
                skillTags={skillTags}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
