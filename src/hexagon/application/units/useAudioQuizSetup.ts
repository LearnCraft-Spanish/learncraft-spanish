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
  // Local state for choice between speaking and listening quizzes
  const [audioQuizType, setAudioQuizType] = useState<AudioQuizType>(
    AudioQuizType.Speaking,
  );

  // Local state for choice to autoplay audio or not
  const [autoplay, setAutoplay] = useState<boolean>(true);

  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useRef<number[]>([10, 20, 50, 100]);

  // Which quiz lengths are usable for the number of examples we have
  const availableQuizLengths: number[] = useMemo(() => {
    // Empty array if examples still loading
    if (!audioExamples) return [];
    // Remove lengths longer than the available set
    const filteredOptions = quizLengthOptions.current.filter(
      (number: number) => number <= audioExamples.length,
    );
    // Add precise total if not included and not equal to an existing option
    if (!filteredOptions.includes(audioExamples.length)) {
      if (audioExamples.length < 100) {
        // Add length if under 100
        filteredOptions.push(audioExamples.length);
      } else {
        // Add total count if over 100
        filteredOptions.push(audioExamples.length);
      }
    }
    // Return parsed options
    // sort by size, smallest to largest
    return filteredOptions.sort((a, b) => a - b);
  }, [audioExamples, quizLengthOptions]);

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
