import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useMemo, useState } from 'react';

export interface TextQuizSetupReturn {
  availableQuizLengths: number[];
  selectedQuizLength: number;
  setSelectedQuizLength: (selectedQuizLength: number) => void;
  srsQuiz: boolean;
  setSrsQuiz: (srsQuiz: boolean) => void;
  startWithSpanish: boolean;
  setStartWithSpanish: (startWithSpanish: boolean) => void;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
  totalExamples: number;
}

export interface TextQuizSetupProps {
  examples: ExampleWithVocabulary[];
  srsQuiz: boolean;
  setSrsQuiz: (srsQuiz: boolean) => void;
  startWithSpanish: boolean;
  setStartWithSpanish: (startWithSpanish: boolean) => void;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
}

export function useTextQuizSetup({
  examples,
  srsQuiz,
  setSrsQuiz,
  startWithSpanish,
  setStartWithSpanish,
  customOnly,
  setCustomOnly,
}: TextQuizSetupProps) {
  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useMemo(() => [10, 20, 50, 75, 100, 150], []);

  // Which quiz lengths are usable for the number of examples we have
  const availableQuizLengths: number[] = useMemo(() => {
    // Empty array if examples still loading
    if (!examples) return [];
    // Remove lengths longer than the available set
    const filteredOptions = quizLengthOptions.filter(
      (number: number) => number <= examples.length,
    );
    // Add precise total if not included and under 150
    if (examples.length < 150 && !filteredOptions.includes(examples.length)) {
      filteredOptions.push(examples.length);
    }
    // Return parsed options
    return filteredOptions.sort();
  }, [examples, quizLengthOptions]);

  // Take the longest available quiz Length as the default
  const lastOption: number = useMemo(() => {
    return availableQuizLengths.slice(-1)[0];
  }, [availableQuizLengths]);

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] = useState<number>(0);

  // Strange pattern but this will only run once since zero will never be an option
  if (lastOption && selectedQuizLength === 0) {
    setSelectedQuizLength(lastOption);
  }

  // Return bundled options
  return {
    totalExamples: examples.length,
    selectedQuizLength,
    srsQuiz,
    setSrsQuiz,
    startWithSpanish,
    setStartWithSpanish,
    customOnly,
    setCustomOnly,
    availableQuizLengths,
    setSelectedQuizLength,
  };
}
