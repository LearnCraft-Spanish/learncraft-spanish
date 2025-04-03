import React from 'react';
import { useVocabularyCreation } from '../../../application/useCases/useVocabularyCreation';
import { useVocabularyTable } from '../../../application/useCases/useVocabularyTable';
import { PasteTable } from '../PasteTable/PasteTable';
import './VocabularyCreator.scss';

interface NonVerbCreatorProps {
  onBack: () => void;
}

export const NonVerbCreator: React.FC<NonVerbCreatorProps> = ({ onBack }) => {
  const tableHook = useVocabularyTable();
  const {
    subcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId,
    creating,
    creationError,
    createVocabularyBatch,
  } = useVocabularyCreation();

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategoryId(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedSubcategoryId) {
      // Validation error - no subcategory selected
      return;
    }

    // Use the tableHook's validation and save functionality
    const result = await tableHook.handleSave();

    if (result) {
      // Pass the data to our use case
      const success = await createVocabularyBatch(result);
      if (success) {
        onBack(); // Return to previous screen on success
      }
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
          {subcategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.type ? ` (${category.type})` : ''}
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
