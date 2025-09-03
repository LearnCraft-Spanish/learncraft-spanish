import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { AudioQuizType } from '@domain/audioQuizzing';
import { useMemo, useState } from 'react';

export function useAudioQuizSetup(examples: ExampleWithVocabulary[]) {
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
  const lastOption: number = availableQuizLengths.slice(-1)[0];

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] =
    useState<number>(lastOption);

  // Return audio quiz hook and local state
  return {
    selectedQuizLength,
    audioQuizType,
    setAudioQuizType,
    autoplay,
    setAutoplay,
    availableQuizLengths,
    setSelectedQuizLength,
  };
}
