import type { FrequensayAnalysisResponse } from '@LearnCraft-Spanish/shared';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { useFrequensayAdapter } from '../adapters/frequensayAdapter';
import useCustomVocabulary from '../useCases/useCustomVocabulary';

interface WordCount {
  word: string;
  count: number;
}

export function useFrequensay() {
  const adapter = useFrequensayAdapter();
  const {
    userAddedVocabulary,
    setUserAddedVocabulary,
    addManualVocabulary,
    disableManualVocabulary,
    enableManualVocabulary,
  } = useCustomVocabulary();
  const { selectedToLesson, selectedProgram } = useSelectedLesson();
  const [userInput, setUserInput] = useState('');

  const [frequensayAnalysis, setFrequensayAnalysis] =
    useState<FrequensayAnalysisResponse | null>(null);

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['frequensay'],
  //   queryFn: adapter.getFrequensayVocabulary,
  //   staleTime: Infinity,
  // });

  const [unknownWordCount, setUnknownWordCount] = useState<WordCount[]>([]);
  const [acceptableWordSpellings, setAcceptableWordSpellings] = useState<
    string[]
  >([]);

  const wordCount = useRef<WordCount[]>([]);
  const passageLength = useRef<number>(0);
  const extraAcceptableWords = useRef<WordCount[]>([]);
  const comprehensionPercentage = useRef<number>(0);

  function copyTable() {
    const headers = 'Word\tCount\n';
    const table = unknownWordCount
      .map((word) => `${word.word}\t${word.count}`)
      .join('\n');

    const copiedText = headers + table;
    navigator.clipboard.writeText(copiedText);
  }

  function countVocabularyWords(string: string): [WordCount[], number] {
    const segmenter = new Intl.Segmenter([], { granularity: 'word' });
    const segmentedText = segmenter.segment(string);
    /*
    const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzáéíóúüñ '
    let sanitizedString = ''
    let i = 0
    while (i < string.length) {
      const character = string[i].toLowerCase()
      if (allowedCharacters.includes(character)){
        sanitizedString += character
      }
      i++
    }
    */
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
    extraAcceptableWords.current = uniqueWordsWithCounts;
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
      if (acceptableWordSpellings.includes(word.word)) {
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
  }, [acceptableWordSpellings]);

  // const getAcceptableWordSpellingsFromSelectedLesson = useCallback(() => {
  //   const acceptableSpellings: string[] = [];
  //   // Foreign Key lookup, form data in backend
  //   if (selectedToLesson?.recordId && data && data.length > 0) {
  //     selectedToLesson.vocabKnown.forEach((vocabName) => {
  //       const vocabularyItem = data.find(
  //         (item) => item.descriptionOfVocabularySkill === vocabName,
  //       );
  //       if (vocabularyItem?.spellings) {
  //         vocabularyItem.spellings.forEach((word) => {
  //           acceptableSpellings.push(word);
  //         });
  //       }
  //     });
  //   }
  //   return acceptableSpellings;
  // }, [selectedToLesson, data]);

  // useEffect(() => {
  //   if (data && data.length > 0) {
  //     const acceptableSpellings =
  //       getAcceptableWordSpellingsFromSelectedLesson();
  //     extraAcceptableWords.current.forEach((word) => {
  //       acceptableSpellings.push(word.word);
  //     });
  //     setAcceptableWordSpellings(acceptableSpellings);
  //   }
  // }, [
  //   selectedToLesson,
  //   data,
  //   userAddedVocabulary,
  //   getAcceptableWordSpellingsFromSelectedLesson,
  // ]);

  // useEffect(() => {
  //   if (selectedToLesson) {
  //     if (selectedToLesson?.recordId) {
  //       filterWordCountByUnknown();
  //     }
  //   }
  // }, [
  //   selectedToLesson,
  //   userInput,
  //   acceptableWordSpellings,
  //   filterWordCountByUnknown,
  // ]);

  const runFrequensayAnalysis = useCallback(async () => {
    if (!selectedProgram?.name || !selectedToLesson?.lessonNumber) {
      return;
    }
    const data = {
      courseName: selectedProgram.name,
      lessonNumber: selectedToLesson.lessonNumber,
    };
    const response = await adapter.getSpellingsKnownForLesson(data);
    setFrequensayAnalysis(response);
  }, [selectedProgram, selectedToLesson, adapter]);

  return {
    // isReady: data && data.length > 0,
    // isLoading,
    // isError: error,

    // data,
    userAddedVocabulary,
    updateUserAddedVocabulary,
    userInput,
    updateUserInput,

    wordCount,
    passageLength,
    extraAcceptableWords,
    unknownWordCount,
    comprehensionPercentage,
    copyTable,

    runFrequensayAnalysis,
    frequensayAnalysis,

    setUserAddedVocabulary,
    addManualVocabulary,
    disableManualVocabulary,
    enableManualVocabulary,
  };
}
