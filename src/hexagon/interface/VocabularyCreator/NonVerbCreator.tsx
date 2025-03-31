import type { TableHook } from '../../application/table/types';
import type { VocabularyEntry } from '../../application/vocabulary/types';
import React from 'react';
import { useVocabularyTable } from '../../application/vocabulary/useVocabularyTable';
import { PasteTable } from '../PasteTable/PasteTable';
import './VocabularyCreator.scss';

interface NonVerbCreatorProps {
  onBack: () => void;
}

export const NonVerbCreator: React.FC<NonVerbCreatorProps> = ({ onBack }) => {
  const tableHook = useVocabularyTable();

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
        <select id="subcategory" className="nonverb-creator__select">
          {/* Options will be populated by hooks */}
        </select>
      </div>

      <PasteTable<VocabularyEntry>
        hook={tableHook}
        saveButtonText="Save Vocabulary"
        clearButtonText="Clear Table"
        pasteHint="Paste vocabulary data (tab-separated) or edit cells directly"
      />
    </div>
  );
};
