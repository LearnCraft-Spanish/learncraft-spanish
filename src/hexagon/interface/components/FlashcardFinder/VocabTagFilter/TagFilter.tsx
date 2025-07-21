import type { SkillTag } from '@LearnCraft-Spanish/shared';
import { SkillType } from '@LearnCraft-Spanish/shared';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

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
                  <h4 className="vocabName">{item.name}</h4>
                  {item.type === SkillType.Vocabulary && (
                    <h5 className="vocabDescriptor">{item.descriptor}</h5>
                  )}
                  {item.type === SkillType.Idiom && (
                    <h5 className="vocabDescriptor">{item.subcategoryName}</h5>
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
