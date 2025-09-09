import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { UseCombinedFiltersWithVocabularyReturnType } from 'src/hexagon/application/units/Filtering/useCombinedFiltersWithVocabulary';
import {
  SelectedTags,
  TagFilter,
  ToggleSwitch,
} from '@interface/components/general';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';
import 'src/App.css';
import './FlashcardManagerFilters.scss';

export default function FlashcardManagerFilters({
  filterState,
  skillTagSearch,
  filterOwnedFlashcards,
  setFilterOwnedFlashcards,
}: {
  filterState: UseCombinedFiltersWithVocabularyReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
}) {
  const {
    combinedFilterState,

    updateExcludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
  } = filterState;

  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
    addTagBackToSuggestions,
  } = skillTagSearch;

  const { excludeSpanglish, audioOnly, skillTags } = combinedFilterState;

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div className="flashcardManagerFilters">
      <div className="ToggleFlashcardFilters">
        <ToggleSwitch
          id="filtersEnabled"
          ariaLabel="filtersEnabled"
          label="Flashcard Filtering: "
          checked={filterOwnedFlashcards}
          onChange={() => setFilterOwnedFlashcards(!filterOwnedFlashcards)}
        />
      </div>
      {filterOwnedFlashcards && (
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
                updateExcludeSpanglish(!combinedFilterState.excludeSpanglish)
              }
            />
            <ToggleSwitch
              id="audioOnly"
              ariaLabel="audioOnly"
              label="Audio Flashcards Only: "
              checked={audioOnly ?? false}
              onChange={() => updateAudioOnly(!combinedFilterState.audioOnly)}
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
