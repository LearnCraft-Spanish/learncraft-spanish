import type { WordCount } from '../types/frequensay';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { copyUnknownWordsTable } from '../units/FrequenSay/utils/copyUnknownWordsTable';
import useSpellingsKnownForLessonRange from '../units/useSpellingsKnownForLessonRange';
import useCustomVocabulary from './useCustomVocabulary';

export interface UseFrequensayResult {
  isSuccess: boolean;
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
  data: string[] | undefined;
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
  const { selectedToLesson, selectedProgram, selectedFromLesson } =
    useSelectedLesson();
  const {
    userAddedVocabulary,
    setUserAddedVocabulary,

    addManualVocabulary,
    disableManualVocabulary,
    enableManualVocabulary,
  } = useCustomVocabulary();

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
  });

  function countVocabularyWords(string: string): [WordCount[], number] {
    const segmenter = new Intl.Segmenter([], { granularity: 'word' });
    const segmentedText = segmenter.segment(string);

    const sanitizedArray = [...segmentedText]
      .filter((s) => s.isWordLike)
      .map((s) => s.segment.toLowerCase());
    let u = 0;
    const localWordCount: WordCount[] = [];

    while (u < sanitizedArray.length) {
      const thisWord = sanitizedArray[u];
      const wordFound = localWordCount.find((word) => word.word === thisWord);
      if (wordFound) {
        wordFound.count++;
      } else if (Number.isNaN(Number.parseFloat(thisWord))) {
        localWordCount.push({ word: thisWord, count: 1 });
      }
      u++;
    }
    localWordCount.sort((a, b) => b.count - a.count);
    return [localWordCount, sanitizedArray.length];
  }

  function updateUserAddedVocabulary(newInput: string) {
    const vocabWordCount = countVocabularyWords(newInput);
    const uniqueWordsWithCounts = vocabWordCount[0];
    setUserAddedVocabulary(newInput);
    setExtraAcceptableWords(uniqueWordsWithCounts);
    return uniqueWordsWithCounts;
  }

  function updateUserInput(newInput: string) {
    const vocabWordCount = countVocabularyWords(newInput);
    const uniqueWordsWithCounts = vocabWordCount[0];
    const totalWordCount = vocabWordCount[1];
    setUserInput(newInput);
    wordCount.current = uniqueWordsWithCounts;
    passageLength.current = totalWordCount;
    return vocabWordCount;
  }

  const filterWordCountByUnknown = useCallback(async () => {
    function filterWordsByUnknown(word: WordCount): boolean {
      if (
        spellingsKnownForLessonRange?.includes(word.word) ||
        extraAcceptableWords.some((w) => w.word === word.word)
      ) {
        return false;
      } else {
        return true;
      }
    }
    const unknownWordCount = wordCount.current.filter(filterWordsByUnknown);
    let totalWordsUnknown = 0;
    unknownWordCount.forEach((count) => {
      totalWordsUnknown += count.count;
    });
    comprehensionPercentage.current =
      passageLength.current > 0
        ? 100 - Math.floor((totalWordsUnknown / passageLength.current) * 100)
        : 100;
    setUnknownWordCount(unknownWordCount);
  }, [spellingsKnownForLessonRange, extraAcceptableWords]);

  useEffect(() => {
    if (selectedToLesson) {
      if (selectedToLesson?.recordId && spellingsKnownForLessonRange) {
        filterWordCountByUnknown();
      }
    }
  }, [
    selectedToLesson,
    selectedFromLesson,
    userInput,
    extraAcceptableWords,

    spellingsKnownForLessonRange,
    filterWordCountByUnknown,
  ]);

  return {
    isSuccess: !!spellingsKnownForLessonRange,
    isError: !!error,
    isLoading,
    data: spellingsKnownForLessonRange,
    error,

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
