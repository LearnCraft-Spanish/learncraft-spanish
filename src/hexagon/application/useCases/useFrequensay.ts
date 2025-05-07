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

  const {
    data: spellingsKnownForLessonRange,
    isLoading,
    error,
  } = useSpellingsKnownForLessonRange({
    courseName: selectedProgram?.name || '',
    lessonToNumber: selectedToLesson?.lessonNumber || 0,
    lessonFromNumber: selectedFromLesson?.lessonNumber || 0,
    isFrequensayEnabled,
  });

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
    if (spellingsKnownForLessonRange) {
      const [unknownWords, , percentage] = filterWordsByUnknown(
        wordCount.current,
        spellingsKnownForLessonRange,
        extraAcceptableWords,
        addManualVocabulary,
      );

      setUnknownWordCount(unknownWords);
      comprehensionPercentage.current = percentage;
    }
  }, [spellingsKnownForLessonRange, extraAcceptableWords, addManualVocabulary]);

  useEffect(() => {
    if (selectedToLesson) {
      if (selectedToLesson?.recordId && spellingsKnownForLessonRange) {
        processUnknownWords();
      }
    }
  }, [
    selectedToLesson,
    selectedFromLesson,
    userInput,
    extraAcceptableWords,
    spellingsKnownForLessonRange,
    processUnknownWords,
  ]);

  return {
    isSuccess: !!spellingsKnownForLessonRange,
    isError: !!error,
    isLoading,
    data: spellingsKnownForLessonRange,
    error,

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
