import React from 'react';
import { useNonVerbCreation } from '../../../application/useCases/useNonVerbCreation';
import { PasteTable } from '../PasteTable/PasteTable';
import './VocabularyCreator.scss';

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

      <PasteTable
        hook={tableHook}
        saveButtonText="Save Vocabulary"
        clearButtonText="Clear Table"
        pasteHint="Paste vocabulary data (tab-separated) or edit cells directly"
      />

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
    </div>
  );
};
