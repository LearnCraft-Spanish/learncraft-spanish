import useVerbCreation from '@application/useCases/useVerbCreation';
import React, { useState } from 'react';
import '@interface/components/vocabulary/VocabularyCreator.scss';

interface VerbCreatorProps {
  onBack: () => void;
}

export const VerbCreator: React.FC<VerbCreatorProps> = ({ onBack }) => {
  const [infinitive, setInfinitive] = useState('');
  const [translation, setTranslation] = useState('');
  const [usage, setUsage] = useState('');
  const [isRegular, setIsRegular] = useState(false);

  // Use the specialized verb creation hook
  const {
    verbSubcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId,
    creating,
    creationError,
    createVerbVocabulary,
  } = useVerbCreation();

  const handleInfinitiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfinitive(e.target.value);
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranslation(e.target.value);
  };

  const handleUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsage(e.target.value);
  };

  const handleRegularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRegular(e.target.checked);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategoryId(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubcategoryId) {
      // Handle validation error
      return;
    }

    // Create and submit the verb using CQRS command
    createVerbVocabulary([
      {
        word: infinitive,
        descriptor: translation,
        subcategoryId: selectedSubcategoryId,
        verbId: 0,
        conjugationTagIds: [],
        frequency: 0,
        notes: usage,
      },
    ]).then((success) => {
      if (success) {
        onBack();
      }
    });
  };

  const isSubmitEnabled =
    infinitive.trim() !== '' &&
    translation.trim() !== '' &&
    selectedSubcategoryId !== 0;

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
          <label htmlFor="subcategory">Verb Category</label>
          <select
            id="subcategory"
            className="verb-creator__select"
            value={selectedSubcategoryId}
            onChange={handleSubcategoryChange}
            disabled={loadingSubcategories || creating}
          >
            <option value="">-- Select Verb Category --</option>
            {verbSubcategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {loadingSubcategories && <span>Loading categories...</span>}
        </div>

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

        <div className="verb-creator__field">
          <label htmlFor="usage">Usage Example (Optional)</label>
          <input
            type="text"
            id="usage"
            className="verb-creator__input"
            value={usage}
            onChange={handleUsageChange}
            placeholder="Example of how to use this verb"
          />
        </div>

        <div className="verb-creator__field verb-creator__field--checkbox">
          <label htmlFor="isRegular">
            <input
              type="checkbox"
              id="isRegular"
              checked={isRegular}
              onChange={handleRegularChange}
            />
            Regular Verb
          </label>
        </div>

        {creationError && (
          <div className="verb-creator__error">
            Error: {creationError.message}
          </div>
        )}

        <div className="verb-creator__actions">
          <button
            type="submit"
            className="verb-creator__submit-button"
            disabled={!isSubmitEnabled || creating}
          >
            {creating ? 'Creating...' : 'Create Verb'}
          </button>
        </div>
      </form>
    </div>
  );
};
