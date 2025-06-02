import type { VocabTag } from 'src/types/interfaceDefinitions';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function TagFilter({
  searchTerm,
  updateSearchTerm,
  searchResults,
  addTag,
}: {
  searchTerm: string;
  updateSearchTerm: (e: EventTarget & HTMLInputElement) => void;
  searchResults: VocabTag[];
  addTag: (tagId: number) => void;
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
        />
        <br></br>
      </div>
      {!!searchTerm.length &&
        contextual === 'tagSuggestionBox' &&
        !!searchResults.length && (
          <div className="tagSuggestionBox" ref={setContextualRef}>
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="tagCard"
                onClick={() => addTag(item.id)}
              >
                <div className={`${item.type}Card`}>
                  <h4 className="vocabName">{item.tag}</h4>
                  {item.vocabDescriptor && (
                    <h5 className="vocabDescriptor">{item.vocabDescriptor}</h5>
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
