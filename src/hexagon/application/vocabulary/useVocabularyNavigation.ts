import { useState } from 'react';

type VocabularyCreationMode = 'selection' | 'verb' | 'nonverb';

export const useVocabularyNavigation = () => {
  const [mode, setMode] = useState<VocabularyCreationMode>('selection');

  const navigateToVerbCreation = () => setMode('verb');
  const navigateToNonVerbCreation = () => setMode('nonverb');
  const navigateToSelection = () => setMode('selection');

  return {
    mode,
    navigateToVerbCreation,
    navigateToNonVerbCreation,
    navigateToSelection,
  };
};
