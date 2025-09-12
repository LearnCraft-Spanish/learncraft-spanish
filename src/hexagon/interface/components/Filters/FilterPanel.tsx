import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import PresetSelector from '@interface/components/FlashcardFinder/PresetSelector';
import {
  SelectedTags,
  TagFilter,
  ToggleSwitch,
} from '@interface/components/general';
import LessonRangeSelector from '@interface/components/LessonSelector/LessonRangeSelector';
import { useState } from 'react';

export default function FilterPanel({
  onFilterChange,
  requireAudioOnly,
}: {
  onFilterChange?: () => void;
  requireAudioOnly: boolean;
}) {
  const [filterMode, setFilterMode] = useState<'preset' | 'search'>('preset');

  const {
    excludeSpanglish,
    audioOnly,
    selectedSkillTags,
    updateExcludeSpanglish,
    updateAudioOnly,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    skillTagSearch,
    filterPreset,
    setFilterPreset,
  } = useCombinedFilters({ onFilterChange });

  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
    addTagBackToSuggestions,
  } = skillTagSearch;

  return (
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
          onChange={() => updateExcludeSpanglish(!excludeSpanglish)}
        />
        {!requireAudioOnly && (
          <ToggleSwitch
            id="audioOnly"
            ariaLabel="audioOnly"
            label="Audio Flashcards Only: "
            checked={audioOnly ?? false}
            onChange={() => updateAudioOnly(!(audioOnly ?? false))}
          />
        )}
      </div>
      <div className="filterBox search">
        <div className="filterHeader">
          <label
            htmlFor="presetMode"
            className={`option ${filterMode === 'preset' ? 'selected' : ''}`}
            onClick={() => setFilterMode('preset')}
          >
            <input type="radio" value="preset" name="filterMode" />
            Presets
          </label>

          <label
            htmlFor="searchMode"
            className={`option ${filterMode === 'search' ? 'selected' : ''}`}
            onClick={() => setFilterMode('search')}
          >
            <input type="radio" value="search" name="filterMode" />
            Search Tags
          </label>
        </div>
        <div className="filterContentWrapper">
          {filterMode === 'preset' && (
            <PresetSelector
              setFilterPreset={setFilterPreset}
              filterPreset={filterPreset}
            />
          )}
          {filterMode === 'search' && (
            <>
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
                skillTags={selectedSkillTags}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
