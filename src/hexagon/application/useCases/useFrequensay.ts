import type { WordCount } from '../types/frequensay';
import { copyUnknownWordsTable } from '@application/units/FrequenSay/utils/copyUnknownWordsTable';
import {
  countVocabularyWords,
  filterWordsByUnknown,
} from '@application/units/FrequenSay/utils/vocabularyProcessing';
import { useSpellingsKnownForLessonRange } from '@application/units/useSpellingsKnownForLessonRange';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import useCustomVocabulary from './useCustomVocabulary';

export interface UseFrequensayResult {
  isSuccess: boolean;
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
  data: string[] | undefined;
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

export function useFrequensay(): UseFrequensayResult {
  const {
    userAddedVocabulary,
    setUserAddedVocabulary,
    addManualVocabulary,
    disableManualVocabulary,
    enableManualVocabulary,
  } = useCustomVocabulary();

  const { selectedToLesson, selectedProgram, selectedFromLesson } =
    useSelectedLesson();

  const [isFrequensayEnabled, setIsFrequensayEnabled] = useState(false);

  const [userInput, setUserInput] = useState('');
  const [unknownWordCount, setUnknownWordCount] = useState<WordCount[]>([]);

  const wordCount = useRef<WordCount[]>([]);
  const passageLength = useRef<number>(0);
  const comprehensionPercentage = useRef<number>(0);
  const [extraAcceptableWords, setExtraAcceptableWords] = useState<WordCount[]>(
    [],
  );

  const spellingsKnownQuery = useSpellingsKnownForLessonRange({
    courseName: selectedProgram?.name || '',
    lessonToNumber: selectedToLesson?.lessonNumber || 0,
    lessonFromNumber: selectedFromLesson?.lessonNumber || 0,
    isFrequensayEnabled,
  });

  function updateUnknownWords(unknownWords: WordCount[]) {
    setUnknownWordCount(unknownWords);
  }

  function updateUserAddedVocabulary(newInput: string) {
    const [uniqueWordsWithCounts] = countVocabularyWords(newInput);
    setUserAddedVocabulary(newInput);
    setExtraAcceptableWords(uniqueWordsWithCounts);
    return uniqueWordsWithCounts;
  }

  function updateUserInput(newInput: string) {
    const [uniqueWordsWithCounts, totalWordCount] =
      countVocabularyWords(newInput);
    setUserInput(newInput);
    wordCount.current = uniqueWordsWithCounts;
    passageLength.current = totalWordCount;
    return [uniqueWordsWithCounts, totalWordCount];
  }

  const processUnknownWords = useCallback(() => {
    if (spellingsKnownQuery.data) {
      const [unknownWords, , percentage] = filterWordsByUnknown(
        wordCount.current,
        spellingsKnownQuery.data,
        extraAcceptableWords,
        addManualVocabulary,
      );

      updateUnknownWords(unknownWords);
      comprehensionPercentage.current = percentage;
    }
  }, [spellingsKnownQuery?.data, extraAcceptableWords, addManualVocabulary]);

  useEffect(() => {
    if (selectedToLesson) {
      if (selectedToLesson?.recordId && spellingsKnownQuery.data) {
        processUnknownWords();
      }
    }
  }, [
    selectedToLesson,
    selectedFromLesson,
    userInput,
    extraAcceptableWords,
    spellingsKnownQuery?.data,
    processUnknownWords,
  ]);

  return {
    isSuccess: !!spellingsKnownQuery?.data,
    isError: !!spellingsKnownQuery?.error,
    isLoading: spellingsKnownQuery?.isLoading,
    data: spellingsKnownQuery?.data,
    error: spellingsKnownQuery?.error,

    FrequensaySetupProps: {
      isFrequensayEnabled,
      setIsFrequensayEnabled,
    },

    CustomVocabularyProps: {
      userAddedVocabulary,
      setUserAddedVocabulary: updateUserAddedVocabulary,
      addManualVocabulary,
      disableManualVocabulary,
      enableManualVocabulary,
    },

    TextToCheckProps: {
      userInput,
      updateUserInput,
      passageLength: passageLength.current,
      comprehensionPercentage: comprehensionPercentage.current,
    },

    UnknownWordsProps: {
      unknownWordCount,
      copyUnknownWordsTable: () => copyUnknownWordsTable(unknownWordCount),
    },
  };
}
