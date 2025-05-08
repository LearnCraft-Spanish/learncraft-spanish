import { useState } from 'react';

export interface UseCustomVocabularyResult {
  addManualVocabulary: boolean;
  enableManualVocabulary: () => void;
  disableManualVocabulary: () => void;
  userAddedVocabulary: string;
  setUserAddedVocabulary: (value: string) => void;
}

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
