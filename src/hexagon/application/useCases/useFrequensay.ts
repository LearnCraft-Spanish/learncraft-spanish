import type { WordCount } from '../types/frequensay';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { useFrequensayAdapter } from '../adapters/frequensayAdapter';
import { copyUnknownWordsTable } from '../units/FrequenSay/utils/copyUnknownWordsTable';
import useCustomVocabulary from './useCustomVocabulary';
export function useFrequensay() {
  const adapter = useFrequensayAdapter();

  const { selectedToLesson, selectedProgram } = useSelectedLesson();
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['SpellingsKnownForLesson', selectedProgram, selectedToLesson],
    queryFn: () => {
      return adapter.getSpellingsKnownForLesson({
        courseName: selectedProgram,
        lessonNumber: selectedToLesson,
      });
    },
    enabled: !!selectedProgram && !!selectedToLesson,
    staleTime: Infinity,
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
      if (data?.includes(word.word)) {
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
  }, [data]);

  useEffect(() => {
    if (selectedToLesson) {
      if (selectedToLesson?.recordId && data) {
        filterWordCountByUnknown();
      }
    }
  }, [selectedToLesson, userInput, data, filterWordCountByUnknown]);

  return {
    isSuccess: !!data,
    isError: !!error,
    isLoading,
    data,
    error,

    CustomVocabularyProps: {
      userAddedVocabulary,
      setUserAddedVocabulary,
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
