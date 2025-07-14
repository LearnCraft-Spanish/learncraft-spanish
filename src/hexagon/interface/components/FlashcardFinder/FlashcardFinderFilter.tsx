import type { UseExampleFilterReturnType } from 'src/hexagon/application/units/useExampleFilter';
import ToggleSwitch from '../general/ToggleSwitch';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';

import SelectedTags from './VocabTagFilter/SelectedTags';
import TagFilter from './VocabTagFilter/TagFilter';
import 'src/App.css';

export default function FlashcardFinderFilter({
  filterState: hookFilterState,
  skillTagSearch,
}: UseExampleFilterReturnType) {
  const {
    filterState,
    filtersChanging,

    updateIncludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    updateFiltersChanging,
  } = hookFilterState;

  const { tagSearchTerm, tagSuggestions, updateTagSearchTerm } = skillTagSearch;

  // const { exampleFilters, course, fromLesson, toLesson } = filterState;
  const { exampleFilters } = filterState;

  const { includeSpanglish, audioOnly } = exampleFilters;

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div className="filterSection">
      {!filtersChanging && (
        <div className="buttonBox">
          <button
            onClick={() => updateFiltersChanging(true)}
            type="button"
            disabled={filtersChanging}
          >
            Change Filters
          </button>
        </div>
      )}
      {filtersChanging && (
        <>
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
              label="Audio FlashcardsOnly: "
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
              />
              <SelectedTags removeTag={removeSkillTagFromFilters} />
            </div>
          </div>
          <div className="buttonBox">
            <button
              onClick={() => updateFiltersChanging(false)}
              type="button"
              disabled={!filtersChanging}
            >
              Get Examples
            </button>
          </div>
        </>
      )}
    </div>
  );
}
