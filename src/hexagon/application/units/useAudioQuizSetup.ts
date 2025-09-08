import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { AudioQuizType } from '@domain/audioQuizzing';
import { useMemo, useRef, useState } from 'react';

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
  audioExamples: ExampleWithVocabulary[],
): AudioQuizSetupReturn {
  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useRef<number[]>([10, 20, 50, 75, 100, 150]);

  // Local state for choice between speaking and listening quizzes
  const [audioQuizType, setAudioQuizType] = useState<AudioQuizType>(
    AudioQuizType.Speaking,
  );

  // Local state for choice to autoplay audio or not
  const [autoplay, setAutoplay] = useState<boolean>(true);

  // Which quiz lengths are usable for the number of examples we have
  const availableQuizLengths: number[] = useMemo(() => {
    // Empty array if examples still loading
    if (!audioExamples) return [];
    // Remove lengths longer than the available set
    const filteredOptions = quizLengthOptions.current.filter(
      (number: number) => number <= audioExamples.length,
    );
    // Add precise total if not included and under 150
    if (
      audioExamples.length < 150 &&
      !filteredOptions.includes(audioExamples.length)
    ) {
      filteredOptions.push(audioExamples.length);
    }
    // Return parsed options
    return filteredOptions.sort();
  }, [audioExamples, quizLengthOptions]);

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] = useState<number>(0);

  // Keep the selected quiz length within the available options
  const safeQuizLength = useMemo(() => {
    if (availableQuizLengths.length === 0) {
      // If no options are available, return 0
      return 0;
    } else if (selectedQuizLength < availableQuizLengths[0]) {
      // If the quiz length is invalid/unspecified, return the largest option
      return availableQuizLengths[availableQuizLengths.length - 1];
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

  // Return audio quiz hook and local state
  return {
    totalExamples: audioExamples.length,
    selectedQuizLength: safeQuizLength,
    audioQuizType,
    setAudioQuizType,
    autoplay,
    setAutoplay,
    availableQuizLengths,
    setSelectedQuizLength,
  };
}
