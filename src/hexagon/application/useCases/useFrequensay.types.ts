import type { WordCount } from '@application/types/frequensay';

export interface UseFrequensayResult {
  spellingsDataError: Error | null;
  spellingsDataLoading: boolean;
  spellingsData: string[];

  FrequensaySetupProps: {
    isFrequensayEnabled: boolean;
    setIsFrequensayEnabled: (value: boolean) => void;
  };
  CustomVocabularyProps: {
    userAddedVocabulary: string;
    setUserAddedVocabulary: (value: string) => void;
    addManualVocabulary: boolean;
    disableManualVocabulary: () => void;
    enableManualVocabulary: () => void;
  };
  TextToCheckProps: {
    userInput: string;
    updateUserInput: (value: string) => void;
    passageLength: number;
    comprehensionPercentage: number;
  };
  UnknownWordsProps: {
    unknownWordCount: WordCount[];
    copyUnknownWordsTable: () => void;
  };
}
