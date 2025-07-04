import ToggleSwitch from '../general/ToggleSwitch';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';
import SelectedTags from './VocabTagFilter/SelectedTags';

import TagFilter from './VocabTagFilter/TagFilter';
import { UseExampleFilterReturnType } from 'src/hexagon/application/units/useExampleFilter';

export default function FlashcardFinderFilter({
  filterState: hookFilterState,
  skillTagSearch,
}: UseExampleFilterReturnType) {
  const {
    filterState,
    filtersChanging,
    updateExcludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    setFiltersChanging,
  } = hookFilterState;

  const { tagSearchTerm, tagSuggestions, updateTagSearchTerm } = skillTagSearch;

  // Create wrapper functions that match ToggleSwitch's expected signature
  const handleUpdateExcludeSpanglish = () => {
    updateExcludeSpanglish(!filterState.exampleFilters.excludeSpanglish);
  };

  const handleUpdateAudioOnly = () => {
    updateAudioOnly(!filterState.exampleFilters.audioOnly);
  };

  const handleAddSkillTagToFilters = (tagKey: string) => {
    addSkillTagToFilters(tagKey);
  };

  const handleRemoveSkillTagFromFilters = (tagKey: string) => {
    removeSkillTagFromFilters(tagKey);
  };

  const { exampleFilters, course, fromLesson, toLesson } = filterState;

  const { excludeSpanglish, audioOnly, skillTags } = exampleFilters;

  // Convert skillTags array of keys to actual SkillTag objects for display
  const selectedTags = skillTags
    .map((tagKey) => tagSuggestions.find((t) => t.key === tagKey))
    .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div className="filterSection">
      {filtersChanging && (
        <div className="buttonBox">
          <button
            onClick={() => setFiltersChanging(true)}
            type="button"
            disabled={filtersChanging}
          >
            Change Filters
          </button>
        </div>
      )}
      {!filtersChanging && (
        <>
          <div className="filterBox options">
            <div className="FromToLessonSelectorWrapper">
              <LessonRangeSelector />
            </div>
            <ToggleSwitch
              id="removeSpanglish"
              ariaLabel="noSpanglish"
              label="Include Spanglish: "
              checked={excludeSpanglish}
              onChange={handleUpdateExcludeSpanglish}
            />
            <ToggleSwitch
              id="audioOnly"
              ariaLabel="audioOnly"
              label="Audio FlashcardsOnly: "
              checked={audioOnly}
              onChange={handleUpdateAudioOnly}
            />
          </div>
          <div className="filterBox search">
            <div className="searchFilter">
              <TagFilter
                searchTerm={tagSearchTerm}
                updateSearchTerm={updateTagSearchTerm}
                searchResults={tagSuggestions}
                addTag={handleAddSkillTagToFilters}
              />
              <SelectedTags
                tags={selectedTags}
                removeTag={handleRemoveSkillTagFromFilters}
              />
            </div>
          </div>
          <div className="buttonBox">
            <button
              onClick={() => setFiltersChanging(false)}
              type="button"
              disabled={filtersChanging}
            >
              Get Examples
            </button>
          </div>
        </>
      )}
    </div>
  );
}
