import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { AudioQuizType } from '@domain/audioQuizzing';
import { useMemo, useState } from 'react';

export interface AudioQuizSetupReturn {
  availableQuizLengths: number[];
  selectedQuizLength: number;
  setSelectedQuizLength: (selectedQuizLength: number) => void;
  totalExamples: number;
  audioQuizType: AudioQuizType;
  setAudioQuizType: (audioQuizType: AudioQuizType) => void;
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
}

export function useAudioQuizSetup(
  examples: ExampleWithVocabulary[],
): AudioQuizSetupReturn {
  // Local state for choice between speaking and listening quizzes
  const [audioQuizType, setAudioQuizType] = useState<AudioQuizType>(
    AudioQuizType.Speaking,
  );

  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useMemo(() => [10, 20, 50, 75, 100, 150], []);

  // Local state for choice to autoplay audio or not
  const [autoplay, setAutoplay] = useState<boolean>(true);

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
    const lastOption = availableQuizLengths.slice(-1)[0];
    return lastOption;
  }, [availableQuizLengths]);

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] = useState<number>(0);

  // Strange pattern but this will only run once since zero will never be an option
  if (lastOption && selectedQuizLength === 0) {
    setSelectedQuizLength(lastOption);
  }

  // Return audio quiz hook and local state
  return {
    totalExamples: examples.length,
    selectedQuizLength,
    audioQuizType,
    setAudioQuizType,
    autoplay,
    setAutoplay,
    availableQuizLengths,
    setSelectedQuizLength,
  };
}
