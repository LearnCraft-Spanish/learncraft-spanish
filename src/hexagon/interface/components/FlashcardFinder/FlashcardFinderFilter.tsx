import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import {
  SectionHeader,
  SelectedTags,
  TagFilter,
  ToggleSwitch,
} from '@interface/components/general';
import { useState } from 'react';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';
import PresetSelector from './PresetSelector';
import Instructions from './units/Instructions';
import ReadOnlyFilters from './units/ReadOnlyFilters';
import './FlashcardFinder.scss';
import 'src/App.css';

export default function FlashcardFinderFilter({
  filtersChanging,
  setFiltersChanging,
  requireAudioOnly = false,
  closeable = true,
}: {
  filtersChanging: boolean;
  setFiltersChanging: (filtersChanging: boolean) => void;
  requireAudioOnly?: boolean;
  closeable?: boolean;
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
  } = useCombinedFilters();

  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
    addTagBackToSuggestions,
  } = skillTagSearch;

  /**
   * TODO: We need an inert (non-interactive) view of the filter state.
   * The filterChanging state prevents refetches during filter manipulation.
   */
  return (
    <div className="flashcardFinderFilter">
      {closeable && (
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
                    skillTags={selectedSkillTags}
                  />,
                ]
              : []
          }
          button={<Instructions />}
          buttonAlwaysVisible
        />
      )}
      {filtersChanging && (
        <>
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
        </>
      )}
    </div>
  );
}
