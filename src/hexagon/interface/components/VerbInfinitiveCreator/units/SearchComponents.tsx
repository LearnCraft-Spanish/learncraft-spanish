import { useState } from 'react';

export default function TagFilter({
  searchTerm,
  updateSearchTerm,
  searchResults,
  addTag,
}: {
  searchTerm: string;
  updateSearchTerm: (value: string) => void;
  searchResults: string[];
  addTag: (tag: string) => void;
}) {
  const [showSearchResults, setShowSearchResults] = useState(false);

  return (
    <div className="tagSearchBox">
      {/*consider adding a Search Icon at some point */}
      <input
        className="searchTermInput"
        type="text"
        onChange={(e) => updateSearchTerm(e.currentTarget.value)}
        placeholder="Search tags"
        value={searchTerm}
        onFocus={() => setShowSearchResults(true)}
        onBlur={() => {
          setTimeout(() => {
            setShowSearchResults(false);
          }, 200);
        }}
      />
      <button
        type="button"
        onClick={() => {
          updateSearchTerm('');
        }}
        className={`clearSearchButton ${!searchTerm.length ? 'disabled' : ''}`}
        disabled={!searchTerm.length}
      >
        Clear
      </button>
      {!!searchResults.length && showSearchResults && (
        <div className="tagSuggestionBox">
          {searchResults.map((item) => (
            <div
              key={item}
              className="tagCard"
              onClick={() => {
                addTag(item);
                updateSearchTerm('');
              }}
            >
              <h4 className="tag">{item}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
