import React, { useState } from 'react';
import './VocabularyCreator.scss';

interface VerbCreatorProps {
  onBack: () => void;
}

export const VerbCreator: React.FC<VerbCreatorProps> = ({ onBack }) => {
  const [infinitive, setInfinitive] = useState('');
  const [translation, setTranslation] = useState('');

  const handleInfinitiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfinitive(e.target.value);
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranslation(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would submit the verb data
    console.error('Verb submitted:', { infinitive, translation });
    onBack();
  };

  const isSubmitEnabled = infinitive.trim() !== '' && translation.trim() !== '';

  return (
    <div className="verb-creator">
      <div className="verb-creator__header">
        <button
          className="verb-creator__back-button"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <h3>Add New Verb</h3>
      </div>
      <form className="verb-creator__form" onSubmit={handleSubmit}>
        <div className="verb-creator__field">
          <label htmlFor="infinitive">Infinitive Form</label>
          <input
            type="text"
            id="infinitive"
            className="verb-creator__input"
            value={infinitive}
            onChange={handleInfinitiveChange}
          />
        </div>
        <div className="verb-creator__field">
          <label htmlFor="translation">English Translation</label>
          <input
            type="text"
            id="translation"
            className="verb-creator__input"
            value={translation}
            onChange={handleTranslationChange}
          />
        </div>
        <div className="verb-creator__tags">
          <label>Conjugation Tags</label>
          <div className="verb-creator__tag-list">
            {/* Tag selection will be handled by hooks */}
          </div>
        </div>
        <div className="verb-creator__actions">
          <button
            type="submit"
            className="verb-creator__submit-button"
            disabled={!isSubmitEnabled}
          >
            Create Verb
          </button>
        </div>
      </form>
    </div>
  );
};
