import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function TagFilter({
  searchTerm,
  updateSearchTerm,
  searchResults,
  addTag,
  removeTagFromSuggestions,
}: {
  searchTerm: string;
  updateSearchTerm: (e?: EventTarget & HTMLInputElement) => void;
  searchResults: SkillTag[];
  addTag: (tagId: string) => void;
  removeTagFromSuggestions: (tagId: string) => void;
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
      {!!searchTerm.length &&
        contextual === 'tagSuggestionBox' &&
        !!searchResults.length && (
          <div className="tagSuggestionBox" ref={setContextualRef}>
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
