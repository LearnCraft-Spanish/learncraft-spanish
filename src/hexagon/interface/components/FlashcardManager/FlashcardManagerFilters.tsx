import type { UseExampleFilterCoordinatorReturnType } from 'src/hexagon/application/coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from 'src/hexagon/application/units/useSkillTagSearch';

import ToggleSwitch from '../general/ToggleSwitch';
import SelectedTags from '../general/VocabTagFilter/SelectedTags';
import TagFilter from '../general/VocabTagFilter/TagFilter';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';

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

  const { excludeSpanglish, audioOnly, skillTags } = filterState;

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
