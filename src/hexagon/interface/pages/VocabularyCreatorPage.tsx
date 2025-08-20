import React, { useState } from 'react';
// import { VerbCreator } from '../components/vocabulary/VerbCreator';
import VerbInfinitiveCreator from '../components/VerbInfinitiveCreator/VerbInfinitiveCreator';
import { NonVerbCreator } from '../components/vocabulary/NonVerbCreator';
import './VocabularyCreator.scss';
export const VocabularyCreatorPage: React.FC = () => {
  const [mode, setMode] = useState('selection');

  const navigateToVerbCreation = () => setMode('verb');
  const navigateToNonVerbCreation = () => setMode('nonverb');
  const navigateToSelection = () => setMode('selection');

  const renderContent = () => {
    switch (mode) {
      case 'verb':
        return <VerbInfinitiveCreator />;
      case 'nonverb':
        return <NonVerbCreator onBack={navigateToSelection} />;
      default:
        return (
          <div className="vocabulary-creator__options">
            <button
              type="button"
              className="vocabulary-creator__option vocabulary-creator__option--verb"
              onClick={navigateToVerbCreation}
            >
              Add New Verb
            </button>
            <button
              type="button"
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
