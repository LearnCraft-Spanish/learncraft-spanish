import { useExampleQuery } from '@application/queries/useExampleQuery';
import { useCustomQuizFilterState } from '@application/units/CustomQuiz';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useMemo, useRef, useState } from 'react';

export function useCustomQuiz() {
  const { filterState } = useCustomQuizFilterState();
  const {
    isLoading: isLoadingExamples,
    filteredExamples,
    totalCount,
    updatePageSize,
  } = useExampleQuery(150, false);
  const [customQuizReady, setCustomQuizReady] = useState(false);
  const [presetQuizReady, setPresetQuizReady] = useState(false);
  const [startWithSpanish, setStartWithSpanish] = useState(false);

  const [customQuizType, setCustomQuizType] = useState<
    'custom-filters' | 'pre-set-quizzes'
  >('custom-filters');

  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useRef<number[]>([10, 20, 50, 100]);

  // Which quiz lengths are usable for the number of examples we have
  const availableQuizLengths: number[] = useMemo(() => {
    // Empty array if examples still loading
    if (!filteredExamples) return [];
    // Remove lengths longer than the available set
    const filteredOptions = quizLengthOptions.current.filter(
      (number: number) => number <= filteredExamples.length,
    );
    // Add precise total if not included and not equal to an existing option
    if (!filteredOptions.includes(filteredExamples.length)) {
      if (filteredExamples.length < 100) {
        // Add length if under 100
        filteredOptions.push(filteredExamples.length);
      } else {
        // Add total count if over 100
        filteredOptions.push(totalCount ?? 0);
      }
    }
    // Return parsed options
    // sort by size, smallest to largest
    return filteredOptions.sort((a, b) => a - b);
  }, [filteredExamples, quizLengthOptions, totalCount]);

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] = useState<number>(0);

  // Keep the selected quiz length within the available options
  const safeQuizLength: number = useMemo(() => {
    if (availableQuizLengths.length === 0) {
      // If no options are available, return 0
      return 0;
    } else if (selectedQuizLength < availableQuizLengths[0]) {
      // If the quiz length is invalid/unspecified, default to 20 if available
      // Otherwise, use the largest available option that's <= 20, or the smallest option
      const defaultOption = availableQuizLengths.includes(20)
        ? 20
        : availableQuizLengths.find((option) => option <= 20) ||
          availableQuizLengths[0];
      return defaultOption;
    }
    // If the quiz length is valid, find all smaller options
    const acceptableOptions: number[] = [];
    for (const option of availableQuizLengths) {
      if (option <= selectedQuizLength) {
        acceptableOptions.push(option);
      }
    }
    // If there are acceptable options, return the largest one
    return acceptableOptions[acceptableOptions.length - 1] || 0;
  }, [selectedQuizLength, availableQuizLengths]);

  const examplesToQuiz = useMemo(() => {
    if (!filteredExamples) return [];
    const shuffledExamples = fisherYatesShuffle(filteredExamples);
    return shuffledExamples.slice(0, safeQuizLength);
  }, [filteredExamples, safeQuizLength]);

  // Function to handle starting the quiz with dynamic page size
  const startCustomQuiz = () => {
    // If the selected quiz length is greater than 150, update the page size
    if (safeQuizLength > 150) {
      updatePageSize(safeQuizLength);
    }
    setCustomQuizReady(true);
  };

  return {
    examplesToQuiz,

    customQuizType,
    setCustomQuizType,
    filterState,

    availableQuizLengths,
    safeQuizLength,
    setSelectedQuizLength,
    startWithSpanish,
    setStartWithSpanish,

    isLoadingExamples,
    totalCount,

    customQuizReady,
    setCustomQuizReady,
    startCustomQuiz,
    presetQuizReady,
    setPresetQuizReady,
  };
}
