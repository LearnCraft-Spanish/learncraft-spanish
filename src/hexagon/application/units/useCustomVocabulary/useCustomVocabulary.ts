import type { UseCustomVocabularyResult } from './useCustomVocabulary.types';
import { useState } from 'react';

export default function useCustomVocabulary(): UseCustomVocabularyResult {
  const [addManualVocabulary, setAddManualVocabulary] = useState(false);
  const [userAddedVocabulary, setUserAddedVocabulary] = useState('');

  const enableManualVocabulary = () => {
    setAddManualVocabulary(true);
  };

  const disableManualVocabulary = () => {
    setAddManualVocabulary(false);
  };

  return {
    addManualVocabulary,
    enableManualVocabulary,
    disableManualVocabulary,

    userAddedVocabulary,
    setUserAddedVocabulary,
  };
}
