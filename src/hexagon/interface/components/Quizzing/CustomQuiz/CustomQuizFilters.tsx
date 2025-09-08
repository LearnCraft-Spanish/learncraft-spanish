import type { CustomQuizFilterState } from '@application/units/CustomQuiz';
import {
  SelectedTags,
  TagFilter,
  ToggleSwitch,
} from '@interface/components/general';
import LessonRangeSelector from '../../LessonSelector/LessonRangeSelector';
import 'src/App.css';
import './CustomQuiz.scss';

export default function CustomQuizFilters({
  filterState,
}: {
  filterState: CustomQuizFilterState;
}) {
  const {
    excludeSpanglish,
    updateExcludeSpanglish,
    audioOnly,
    updateAudioOnly,
    tagSearchTerm,
    updateTagSearchTerm,
    tagSuggestions,
    addSkillTagToFilters,
    removeTagFromSuggestions,
    skillTags,
    removeSkillTagFromFilters,
  } = filterState;

  /*
  excludeSpanglish
  updateExcludeSpanglish

  tagSearchTerm
  updateTagSearchTerm
  tagSuggestions
  addSkillTagToFilters
  removeTagFromSuggestions

  skillTags
  removeSkillTagFromFilters(remove tag) => {
    removeSkillTagFromFilters(tagId);
    addTagBackToSuggestions(tagId);
  }
 */

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div className="CustomQuizFilters">
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
              removeTag={removeSkillTagFromFilters}
              skillTags={skillTags}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
