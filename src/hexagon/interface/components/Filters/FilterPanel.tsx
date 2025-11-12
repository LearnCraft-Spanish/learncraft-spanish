import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import PresetSelector from '@interface/components/Filters/PresetSelector';
import {
  SelectedTags,
  TagFilter,
  ToggleSwitch,
} from '@interface/components/general';
import LessonRangeSelector from '@interface/components/LessonSelector/LessonRangeSelector';
import { useState } from 'react';
import '@interface/components/Filters/FilterPanel.scss';

export function FilterPanel({
  onFilterChange,
  requireAudioOnly,
  requireNoSpanglish,
}: {
  onFilterChange?: () => void;
  requireAudioOnly: boolean;
  requireNoSpanglish: boolean;
}) {
  const [filterMode, setFilterMode] = useState<'preset' | 'search'>('search');

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
    <div className="filterPanel">
      <div className="filterPanelColumn basicOptions">
        {/* <div className="filterPanelRightSide"> */}
        <div className="FromToLessonSelectorWrapper">
          <LessonRangeSelector />
        </div>
        {!requireNoSpanglish && (
          <ToggleSwitch
            id="removeSpanglish"
            ariaLabel="noSpanglish"
            label="Exclude Spanglish: "
            checked={excludeSpanglish ?? false}
            onChange={() => updateExcludeSpanglish(!excludeSpanglish)}
          />
        )}
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
      <div className="filterPanelColumn tagFiltering">
        <div className="filterPanel_modeSelector">
          <label
            htmlFor="searchMode"
            className={`modeSelectorOption ${filterMode === 'search' ? 'selected' : ''}`}
            onClick={() => setFilterMode('search')}
          >
            <input type="radio" value="search" name="filterMode" />
            Search Tags
          </label>
          <label
            htmlFor="presetMode"
            className={`modeSelectorOption ${filterMode === 'preset' ? 'selected' : ''}`}
            onClick={() => setFilterMode('preset')}
          >
            <input type="radio" value="preset" name="filterMode" />
            Presets
          </label>
        </div>
        <div className="filterPanel_contentArea">
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
