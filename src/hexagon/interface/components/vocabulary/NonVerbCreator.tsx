import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import useNonVerbCreation from '@application/useCases/useNonVerbCreation';
import { PasteTable } from '@interface/components/PasteTable/PasteTable';
import { PaginatedVocabularyTable } from '@interface/components/VocabularyTable/PaginatedVocabularyTable';
import React from 'react';
import './VocabularyCreator.scss';

const vocabularyDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'word', label: 'Word', width: '1fr' },
  { id: 'descriptor', label: 'Descriptor', width: '2fr' },
  { id: 'frequency', label: 'Frequency', width: '0.5fr' },
  { id: 'notes', label: 'Notes', width: '1fr' },
];

interface NonVerbCreatorProps {
  onBack: () => void;
}

export const NonVerbCreator: React.FC<NonVerbCreatorProps> = ({ onBack }) => {
  // Use a single hook that implements the Façade pattern
  const {
    nonVerbSubcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId,
    creating,
    creationError,
    tableHook,
    saveVocabulary,
    currentVocabularyPagination,
  } = useNonVerbCreation();

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategoryId(e.target.value);
  };

  const handleSave = async () => {
    const success = await saveVocabulary();
    if (success) {
      onBack(); // Return to previous screen on success
    }
  };

  return (
    <div className="nonverb-creator">
      <div className="nonverb-creator__header">
        <button
          type="button"
          className="nonverb-creator__back-button"
          onClick={onBack}
        >
          ← Back
        </button>
        <h3>Add Non-Verb Vocabulary</h3>
      </div>

      <div className="nonverb-creator__subcategory-select">
        <label htmlFor="subcategory">Select Subcategory</label>
        <select
          id="subcategory"
          className="nonverb-creator__select"
          value={selectedSubcategoryId}
          onChange={handleSubcategoryChange}
          disabled={loadingSubcategories || creating}
        >
          <option value="">-- Select Subcategory --</option>
          {nonVerbSubcategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category}
              {category.partOfSpeech ? ` (${category.partOfSpeech})` : ''}
            </option>
          ))}
        </select>
        {loadingSubcategories && <span>Loading subcategories...</span>}
      </div>

      {creationError && (
        <div className="nonverb-creator__error">
          Error: {creationError.message}
        </div>
      )}

      {/* Add new vocabulary section - always shown */}
      <div className="nonverb-creator__add-new">
        <h4>Add new vocabulary:</h4>
        <PasteTable
          hook={tableHook}
          displayConfig={vocabularyDisplayConfig}
          clearButtonText="Clear Table"
          pasteHint="Paste vocabulary data (tab-separated) or edit cells directly"
        />
      </div>

      {/* Save button */}
      <div className="nonverb-creator__actions">
        <button
          type="button"
          className="nonverb-creator__save-button"
          onClick={handleSave}
          disabled={
            !selectedSubcategoryId ||
            !tableHook.isSaveEnabled ||
            creating ||
            loadingSubcategories
          }
        >
          {creating ? 'Saving...' : 'Save All Vocabulary'}
        </button>
      </div>

      {/* Display existing vocabulary if a subcategory is selected */}
      {selectedSubcategoryId && (
        <div className="nonverb-creator__existing-vocabulary">
          <h4>Existing vocabulary in this subcategory:</h4>
          {currentVocabularyPagination ? (
            <PaginatedVocabularyTable
              paginationState={currentVocabularyPagination}
              className="nonverb-creator__vocabulary-table"
              emptyMessage="No vocabulary items found in this subcategory."
            />
          ) : (
            <div className="nonverb-creator__empty-state">
              Select a subcategory to view existing vocabulary
            </div>
          )}
        </div>
      )}
    </div>
  );
};
