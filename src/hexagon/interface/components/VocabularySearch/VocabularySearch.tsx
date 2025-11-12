import type { VocabularyAbbreviation } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import '@interface/components/VocabularySearch/VocabularySearch.scss';

interface VocabularySearchProps {
  vocabularyList: VocabularyAbbreviation[];
  onVocabularySelect: (vocabId: number) => void;
  selectedVocabId: number;
  placeholder?: string;
  minSearchLength?: number;
  maxResults?: number;
}

export default function VocabularySearch({
  vocabularyList,
  onVocabularySelect,
  selectedVocabId,
  placeholder = 'Search vocabulary...',
  minSearchLength = 1,
  maxResults = 10,
}: VocabularySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter vocabulary based on search term
  const filteredVocabulary = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < minSearchLength) {
      return [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = vocabularyList.filter((vocab) => {
      const wordMatch = vocab.word?.toLowerCase().includes(lowerSearchTerm);
      const descriptorMatch = vocab.descriptor
        ?.toLowerCase()
        .includes(lowerSearchTerm);

      return wordMatch || descriptorMatch;
    });

    // Limit results
    return filtered.slice(0, maxResults);
  }, [vocabularyList, searchTerm, minSearchLength, maxResults]);

  // Get selected vocabulary item for display
  const selectedVocabulary = useMemo(() => {
    return vocabularyList.find((vocab) => vocab.id === selectedVocabId);
  }, [vocabularyList, selectedVocabId]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setIsDropdownOpen(value.length >= minSearchLength);
    },
    [minSearchLength],
  );

  const handleVocabularySelect = useCallback(
    (vocabId: number) => {
      onVocabularySelect(vocabId);
      setSearchTerm('');
      setIsDropdownOpen(false);
    },
    [onVocabularySelect],
  );

  const handleInputFocus = useCallback(() => {
    if (searchTerm.length >= minSearchLength) {
      setIsDropdownOpen(true);
    }
  }, [searchTerm.length, minSearchLength]);

  const handleInputBlur = useCallback(() => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => setIsDropdownOpen(false), 150);
  }, []);

  const handleClearSelection = useCallback(() => {
    onVocabularySelect(0);
  }, [onVocabularySelect]);

  return (
    <div className="vocabulary-search">
      {/* Selected vocabulary display */}
      {selectedVocabulary && (
        <div className="vocabulary-search__selected-display">
          <span className="vocabulary-search__selected-text">
            <strong>Selected:</strong> {selectedVocabulary.word} -{' '}
            {selectedVocabulary.descriptor}
          </span>
          <button
            type="button"
            className="vocabulary-search__clear-button"
            onClick={handleClearSelection}
            aria-label="Clear selection"
          >
            ×
          </button>
        </div>
      )}

      {/* Search input - always visible */}
      <div className="vocabulary-search__input-container">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="vocabulary-search__input"
        />
      </div>

      {isDropdownOpen && filteredVocabulary.length > 0 && (
        <div className="vocabulary-search__dropdown">
          {filteredVocabulary.map((vocab) => (
            <div
              key={vocab.id}
              className={`vocabulary-search__dropdown-item ${
                selectedVocabId === vocab.id
                  ? 'vocabulary-search__dropdown-item--selected'
                  : ''
              }`}
              onClick={() => handleVocabularySelect(vocab.id)}
            >
              <div className="vocabulary-search__item-word">{vocab.word}</div>
              <div className="vocabulary-search__item-descriptor">
                {vocab.descriptor}
              </div>
              <div className="vocabulary-search__item-subcategory">
                {vocab.subcategoryAbr?.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen &&
        searchTerm.length >= minSearchLength &&
        filteredVocabulary.length === 0 && (
          <div className="vocabulary-search__no-results">
            <p>No vocabulary found matching "{searchTerm}"</p>
          </div>
        )}
    </div>
  );
}
