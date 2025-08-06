import type { UseExampleFilterCoordinatorReturnType } from 'src/hexagon/application/coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from 'src/hexagon/application/units/useSkillTagSearch';

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
  filtersChanging,
  setFiltersChanging,
}: {
  filterState: UseExampleFilterCoordinatorReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;
  filtersChanging: boolean;
  setFiltersChanging: (filtersChanging: boolean) => void;
}) {
  const {
    filterState,
    updateExcludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
  } = hookFilterState;

  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
    addTagBackToSuggestions,
  } = skillTagSearch;

  const { excludeSpanglish, audioOnly, skillTags, toLessonNumber } =
    filterState;

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div>
      <SectionHeader
        title="Flashcard Finder Filters"
        isOpen={filtersChanging}
        openFunction={() => setFiltersChanging(!filtersChanging)}
        afterTitleComponents={
          !filtersChanging
            ? [
                <ReadOnlyFilters
                  key="readOnlyFilters"
                  excludeSpanglish={excludeSpanglish ?? false}
                  audioOnly={audioOnly ?? false}
                  skillTags={skillTags}
                />,
              ]
            : []
        }
        button={
          filtersChanging && (
            <div className="getExamplesButtonWrapper">
              <button
                onClick={() => setFiltersChanging(false)}
                type="button"
                className="getExamplesButton"
                disabled={!filtersChanging || !toLessonNumber}
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
              label="Exclude Spanglish: "
              checked={excludeSpanglish ?? false}
              onChange={() =>
                updateExcludeSpanglish(!filterState.excludeSpanglish)
              }
            />
            <ToggleSwitch
              id="audioOnly"
              ariaLabel="audioOnly"
              label="Audio Flashcards Only: "
              checked={audioOnly ?? false}
              onChange={() => updateAudioOnly(!filterState.audioOnly)}
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
                removeTag={(tagId) => {
                  removeSkillTagFromFilters(tagId);
                  addTagBackToSuggestions(tagId);
                }}
                skillTags={skillTags}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
