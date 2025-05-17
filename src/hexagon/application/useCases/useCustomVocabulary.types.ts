export interface UseCustomVocabularyResult {
  addManualVocabulary: boolean;
  enableManualVocabulary: () => void;
  disableManualVocabulary: () => void;
  userAddedVocabulary: string;
  setUserAddedVocabulary: (value: string) => void;
}
