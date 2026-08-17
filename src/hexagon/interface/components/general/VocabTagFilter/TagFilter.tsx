import type { SkillTag } from '@learncraft-spanish/shared';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { SkillType } from '@learncraft-spanish/shared';
import './VocabTagFilter.scss';

export default function TagFilter({
  searchTerm,
  updateSearchTerm,
  searchResults,
  addTag,
  removeTagFromSuggestions,
  restrictTagsToLessonRange = true,
}: {
  searchTerm: string;
  updateSearchTerm: (e?: EventTarget & HTMLInputElement) => void;
  searchResults: SkillTag[];
  addTag: (tagId: string) => void;
  removeTagFromSuggestions: (tagId: string) => void;
  restrictTagsToLessonRange?: boolean;
}) {
  const { contextual, setContextualRef, openContextual } = useContextualMenu();

  return (
    <div className="tagSearchBox">
      <div className="searchTermBox">
        {/*consider adding a Search Icon at some point */}
        <input
          type="text"
          onChange={(e) => updateSearchTerm(e.currentTarget)}
          onClick={() => openContextual('tagSuggestionBox')}
          placeholder="Search tags"
          value={searchTerm}
        />
        <button
          type="button"
          onClick={() => {
            updateSearchTerm();
          }}
          className={`clearSearchButton ${!searchTerm.length ? 'disabled' : ''}`}
          disabled={!searchTerm.length}
        >
          Clear
        </button>
      </div>
      {!!searchTerm.length && contextual === 'tagSuggestionBox' && (
        <div className="tagSuggestionBox" ref={setContextualRef}>
          {!searchResults.length && (
            <p className="noTagSuggestions">
              {restrictTagsToLessonRange
                ? 'No matching tags are taught in your selected lessons. Try widening your lesson range.'
                : 'No matching tags.'}
            </p>
          )}
          {searchResults.map((item) => (
            <div
              key={item.key}
              className="tagCard"
              onClick={() => {
                addTag(item.key);
                removeTagFromSuggestions(item.key);
              }}
            >
              <div className={`${item.type}Card`}>
                <h4 className="vocabName">
                  {item.type === SkillType.Subcategory
                    ? item.subcategory
                    : item.name}
                </h4>
                {item.type === SkillType.Vocabulary && (
                  <h5 className="vocabDescriptor">{item.descriptor}</h5>
                )}
                {item.type === SkillType.Idiom && (
                  <h5 className="vocabDescriptor">{item.subcategoryName}</h5>
                )}
                {item.type === SkillType.Verb && (
                  <h5 className="vocabDescriptor">
                    {item.verbTags.join(' - ')}
                  </h5>
                )}
                <p className="vocabUse">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
