import type { UseExampleFilterCoordinatorReturnType } from 'src/hexagon/application/coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from 'src/hexagon/application/units/useSkillTagSearch';

import SelectedTags from './FlashcardFinder/VocabTagFilter/SelectedTags';
import TagFilter from './FlashcardFinder/VocabTagFilter/TagFilter';
import ToggleSwitch from './general/ToggleSwitch';
import LessonRangeSelector from './LessonSelector/LessonRangeSelector';

import 'src/App.css';
import './FlashcardManagerFilters.scss';

export default function FlashcardManagerFilters({
  filterState: hookFilterState,
  skillTagSearch,
  filtersEnabled,
  toggleFilters,
}: {
  filterState: UseExampleFilterCoordinatorReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;
  filtersEnabled: boolean;
  toggleFilters: () => void;
}) {
  const {
    filterState,

    updateIncludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
  } = hookFilterState;

  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
  } = skillTagSearch;

  const { includeSpanglish, audioOnly, skillTags } = filterState;

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div>
      <div className="ToggleFlashcardFilters">
        <ToggleSwitch
          id="filtersEnabled"
          ariaLabel="filtersEnabled"
          label="Flashcard Filtering: "
          checked={filtersEnabled}
          onChange={toggleFilters}
        />
      </div>
      {filtersEnabled && (
        <div className="filterSection">
          <div className="filterBox options">
            <div className="FromToLessonSelectorWrapper">
              <LessonRangeSelector />
            </div>
            <ToggleSwitch
              id="removeSpanglish"
              ariaLabel="noSpanglish"
              label="Include Spanglish: "
              checked={includeSpanglish ?? true}
              onChange={() =>
                updateIncludeSpanglish(!filterState.includeSpanglish)
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
