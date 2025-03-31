import React from 'react';
import { useVocabularyNavigation } from '../../application/vocabulary/useVocabularyNavigation';
import { NonVerbCreator } from './NonVerbCreator';
import { VerbCreator } from './VerbCreator';
import './VocabularyCreator.scss';

export const VocabularyCreator: React.FC = () => {
  const {
    mode,
    navigateToVerbCreation,
    navigateToNonVerbCreation,
    navigateToSelection,
  } = useVocabularyNavigation();

  const renderContent = () => {
    switch (mode) {
      case 'verb':
        return <VerbCreator onBack={navigateToSelection} />;
      case 'nonverb':
        return <NonVerbCreator onBack={navigateToSelection} />;
      default:
        return (
          <div className="vocabulary-creator__options">
            <button
              className="vocabulary-creator__option vocabulary-creator__option--verb"
              onClick={navigateToVerbCreation}
            >
              Add New Verb
            </button>
            <button
              className="vocabulary-creator__option vocabulary-creator__option--nonverb"
              onClick={navigateToNonVerbCreation}
            >
              Add Non-Verb Vocabulary
            </button>
          </div>
        );
    }
  };

  return (
    <div className="vocabulary-creator">
      <h2>Create Vocabulary</h2>
      {renderContent()}
    </div>
  );
};
