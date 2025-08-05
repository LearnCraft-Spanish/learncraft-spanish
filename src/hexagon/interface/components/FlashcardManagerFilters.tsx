import type { UseExampleFilterCoordinatorReturnType } from 'src/hexagon/application/coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from 'src/hexagon/application/units/useSkillTagSearch';

import useExampleFilter from 'src/hexagon/application/units/useExampleFilter';
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
  const { skillTags } = useExampleFilter();

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

  const { exampleFilters } = filterState;

  const { includeSpanglish, audioOnly } = exampleFilters;

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
