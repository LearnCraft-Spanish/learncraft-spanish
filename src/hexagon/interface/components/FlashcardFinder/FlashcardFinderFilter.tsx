import type { VocabTag } from 'src/types/interfaceDefinitions';

import ToggleSwitch from '../general/ToggleSwitch';
import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';
import SelectedTags from './VocabTagFilter/SelectedTags';

import TagFilter from './VocabTagFilter/TagFilter';

export default function FlashcardFinderFilter({
  includeSpanglish,
  toggleIncludeSpanglish,
  audioOnly,
  toggleAudioOnly,

  tagSearchTerm,
  updateTagSearchTerm,
  suggestedTags,
  addTag,
  removeTag,
  selectedTags,

  handleGetExamplesFromTags,
  getExamplesReady,
}: {
  includeSpanglish: boolean;
  toggleIncludeSpanglish: () => void;
  audioOnly: boolean;
  toggleAudioOnly: () => void;

  tagSearchTerm: string;
  updateTagSearchTerm: (target: EventTarget & HTMLInputElement) => void;
  suggestedTags: VocabTag[];
  addTag: (id: number) => void;
  removeTag: (id: number) => void;
  selectedTags: VocabTag[];

  handleGetExamplesFromTags: () => void;
  getExamplesReady: boolean;
}) {
  return (
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
          onChange={toggleIncludeSpanglish}
        />
        <ToggleSwitch
          id="audioOnly"
          ariaLabel="audioOnly"
          label="Audio FlashcardsOnly: "
          checked={audioOnly}
          onChange={toggleAudioOnly}
        />
      </div>
      <div className="filterBox search">
        <div className="searchFilter">
          <TagFilter
            searchTerm={tagSearchTerm}
            updateSearchTerm={updateTagSearchTerm}
            searchResults={suggestedTags}
            addTag={addTag}
          />
          <SelectedTags tags={selectedTags} removeTag={removeTag} />
        </div>
      </div>
      <div className="buttonBox">
        <button
          onClick={handleGetExamplesFromTags}
          type="button"
          disabled={!getExamplesReady}
        >
          Get Examples
        </button>
      </div>
    </div>
  );
}
