import React from 'react';
import './VocabularyCreator.scss';

interface VerbCreatorProps {
  onBack: () => void;
}

export const VerbCreator: React.FC<VerbCreatorProps> = ({ onBack }) => {
  return (
    <div className="verb-creator">
      <div className="verb-creator__header">
        <button className="verb-creator__back-button" onClick={onBack}>
          ← Back
        </button>
        <h3>Add New Verb</h3>
      </div>
      <form className="verb-creator__form">
        <div className="verb-creator__field">
          <label htmlFor="infinitive">Infinitive Form</label>
          <input type="text" id="infinitive" className="verb-creator__input" />
        </div>
        <div className="verb-creator__field">
          <label htmlFor="translation">English Translation</label>
          <input type="text" id="translation" className="verb-creator__input" />
        </div>
        <div className="verb-creator__tags">
          <label>Conjugation Tags</label>
          <div className="verb-creator__tag-list">
            {/* Tag selection will be handled by hooks */}
          </div>
        </div>
      </form>
    </div>
  );
};
