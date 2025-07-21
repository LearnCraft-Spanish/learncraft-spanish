import type { WordCount } from '../types/frequensay';
import type { UseFrequensayResult } from './useFrequensay.types';
import { copyUnknownWordsTable } from '@application/units/FrequenSay/utils/copyUnknownWordsTable';
import {
  countVocabularyWords,
  filterWordsByUnknown,
} from '@application/units/FrequenSay/utils/vocabularyProcessing';
import { useSpellingsKnownForLesson } from '@application/units/useSpellingsKnownForLesson';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
import useCustomVocabulary from './useCustomVocabulary';
export function useFrequensay(): UseFrequensayResult {
  const {
    userAddedVocabulary,
    setUserAddedVocabulary,
    addManualVocabulary,
    disableManualVocabulary,
    enableManualVocabulary,
  } = useCustomVocabulary();

  const { toLesson, course } = useSelectedCourseAndLessons();

  const [isFrequensayEnabled, setIsFrequensayEnabled] = useState(false);

  const [userInput, setUserInput] = useState('');

  const wordCount = useRef<WordCount[]>([]);
  const passageLength = useRef<number>(0);
  const comprehensionPercentage = useRef<number>(0);
  const [extraAcceptableWords, setExtraAcceptableWords] = useState<WordCount[]>(
    [],
  );

  const {
    data: spellingsKnownData,
    isLoading: spellingsDataLoading,
    error: spellingsDataError,
  } = useSpellingsKnownForLesson({
    courseId: course?.id,
    lessonNumber: toLesson?.lessonNumber,
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
    if (spellingsKnownData) {
      const [unknownWords, percentage] = filterWordsByUnknown(
        wordCount.current,
        spellingsKnownData,
        extraAcceptableWords,
        addManualVocabulary,
      );

      comprehensionPercentage.current = percentage;
      return unknownWords;
    }
    return [];
  }, [spellingsKnownData, extraAcceptableWords, addManualVocabulary]);

  const unknownWordCount = useMemo(() => {
    if (toLesson) {
      if (toLesson?.id && spellingsKnownData && userInput.length > 0) {
        return processUnknownWords();
      }
    }
    return [];
  }, [toLesson, spellingsKnownData, processUnknownWords, userInput]);

  return {
    spellingsDataError,
    spellingsDataLoading,
    spellingsData: spellingsKnownData ?? [],

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
