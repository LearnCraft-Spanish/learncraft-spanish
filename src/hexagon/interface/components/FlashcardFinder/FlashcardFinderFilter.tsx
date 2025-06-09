import type { VocabTag } from 'src/types/interfaceDefinitions';

import LessonRangeSelector from '../LessonSelector/LessonRangeSelector';
import SelectedTags from '../VocabTagFilter/SelectedTags';
import TagFilter from '../VocabTagFilter/TagFilter';

export default function FlashcardFinderFilter({
  includeSpanglish,
  toggleIncludeSpanglish,
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
        <div className="removeSpanglishBox">
          <p>Include Spanglish: </p>
          <label
            htmlFor="removeSpanglish"
            className="switch"
            aria-label="noSpanglish"
          >
            <input
              type="checkbox"
              name="removeSpanglish"
              id="removeSpanglish"
              checked={includeSpanglish}
              style={
                includeSpanglish
                  ? { backgroundColor: 'darkgreen' }
                  : { backgroundColor: 'darkred' }
              }
              onChange={toggleIncludeSpanglish}
            />
            <span className="slider round"></span>
          </label>
        </div>
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
