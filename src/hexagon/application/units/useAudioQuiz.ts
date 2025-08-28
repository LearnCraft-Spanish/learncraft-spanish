import type { Example } from '@learncraft-spanish/shared';
import type React from 'react';
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface StepValue {
  audio: string;
  text: string | React.JSX.Element;
  step: stepValues | '';
}

type stepValues = 'question' | 'guess' | 'hint' | 'answer';

interface AudioQuizProps {
  examplesToQuiz: Example[];
  quizLength?: number;
  audioOrComprehension?: 'audio' | 'comprehension';
  autoplay: boolean;
  cleanupFunction: () => void;
}

export default function useAudioQuiz({
  examplesToQuiz,
  audioOrComprehension = 'comprehension',
  autoplay,
}: AudioQuizProps) {
  const { appUser } = useActiveStudent();
  const _audioAdapter = useAudioAdapter();

  // Examples Table after: filtedBylessonId, shuffled
  // const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]) // This is the proper pattern for flat state
  const [currentExampleIndex, setCurrentExampleIndex] = useState<number>(0); // Array Index of displayed example

  // Audio Handling
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevAudioRefDuration = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | undefined>(0);
  const currentCountdownLength = useRef<number>(0);
  const currentCountdown = useRef<any>(0);
  const [progressStatus, setProgressStatus] = useState<number>(0); // visual progress bar percentage (0-100)

  const preloadEnglishAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadSpanishAudioRef = useRef<HTMLAudioElement | null>(null);

  const [initialQuizStart, setInitialQuizStart] = useState<boolean>(false); // Makes sure the first quiz audio is loaded and playing before countdown starts

  const quizReady = useMemo(
    () => examplesToQuiz.length > 0 && appUser,
    [appUser, examplesToQuiz.length],
  );

  // Memo the current example
  // This will update whenever the currentExampleIndex changes
  const currentExample = useMemo((): Example | undefined => {
    if (examplesToQuiz.length > 0) {
      return examplesToQuiz[currentExampleIndex];
    }
  }, [examplesToQuiz, currentExampleIndex]);

  // New Step Handling Variables
  // Using a state to control the current step so the UI can update
  const [currentStep, setCurrentStep] = useState<stepValues>('question');
  // steps = ['question', 'guess', 'hint', 'answer']

  // Step Values for each: Will be derived from the current example
  const questionValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      const isAudioQuiz = audioOrComprehension === 'audio';
      if (isAudioQuiz) {
        return {
          audio: currentExample?.englishAudio,
          text: 'Playing English!',
          step: 'question',
        } satisfies StepValue;
      } else {
        return {
          audio: currentExample?.spanishAudio,
          text: 'Listen to the audio',
          step: 'question',
        } satisfies StepValue;
      }
    } else {
      return { audio: '', text: '', step: 'question' } satisfies StepValue;
    }
  }, [currentExample, currentStep, audioOrComprehension]);

  const guessValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return { audio: '', text: 'Make a guess!', step: 'guess' };
    }
    return { audio: '', text: '', step: 'guess' };
  }, [currentExample, currentStep]);

  const hintValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? {
            audio: currentExample?.spanishAudio,
            text: 'Playing Spanish!',
            step: 'hint',
          }
        : {
            audio: currentExample?.spanishAudio,
            text: currentExample?.spanish,
            step: 'hint',
          };
    }
    return { audio: '', text: '', step: 'hint' };
  }, [currentExample, currentStep, audioOrComprehension]);

  const answerValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? {
            audio: currentExample?.spanishAudio,
            text: currentExample.spanish,
            step: 'answer',
          }
        : {
            audio: '',
            text: currentExample?.english,
            step: 'answer',
          };
    }
    return { audio: '', text: '', step: 'answer' };
  }, [currentExample, currentStep, audioOrComprehension]);

  // Get the values related to the current step
  const currentStepValue = useMemo(() => {
    switch (currentStep) {
      case 'question':
        return questionValue;
      case 'guess':
        return guessValue;
      case 'hint':
        return hintValue;
      case 'answer':
        return answerValue;
      default:
        console.error('Invalid currentStep value: ', currentStep);
        return questionValue;
    }
  }, [currentStep, questionValue, guessValue, hintValue, answerValue]);

  /*       Countdown Timer Functions      */
  // Countdown Timer, updates progress bar and autoplay timer
  const updateCountdown = useCallback(() => {
    if (countdown && countdown > 0 && currentCountdownLength.current > 0) {
      const newNumber = Math.floor((countdown - 0.05) * 100) / 100;
      setCountdown(newNumber);
      const progressPercent =
        (currentCountdownLength.current - newNumber) /
        currentCountdownLength.current;
      setProgressStatus(progressPercent);
      // } else if (currentCountdownLength.current > 0) {
      //   setCountdown(0);
      // } else {
      //   setCountdown(undefined);
      // }
    } else {
      setCountdown(0);
    }
  }, [countdown, currentCountdownLength]);

  function clearCountDown() {
    clearTimeout(currentCountdown.current);
    currentCountdownLength.current = 0;
    setCountdown(undefined);
  }

  function startCountdown(length: number) {
    currentCountdownLength.current = length;
    setCountdown(length);
  }

  /*       Audio Handling     */
  const playAudio = useCallback(async () => {
    // Audio playing logic
    if (currentStepValue.audio) {
      try {
        await audioRef.current?.play();
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error('Error playing audio. Error: ', e);
        }
      }
      // audioRef.current.play().catch((e: unknown) => {
      //   if (e instanceof Error) {
      //     console.error(e.message);
      //   } else {
      //     console.error('Error playing audio. Error: ', e);
      //   }
      // });
    }
    // setting length for progress bar countdown
    if (autoplay) {
      if (audioRef.current?.duration) {
        const currentDuration = audioRef.current.duration;
        startCountdown(currentDuration + 1.5);
        if (!initialQuizStart) {
          setInitialQuizStart(true);
        }
      } else {
        if (prevAudioRefDuration.current) {
          startCountdown(prevAudioRefDuration.current + 1.5);
        }
      }
    }
  }, [autoplay, initialQuizStart, currentStepValue]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const resumePlayback = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
    if (audioRef.current?.duration) {
      audioRef.current.play();
    }
    updateCountdown();
  }, [isPlaying, updateCountdown]);

  function pausePlayback() {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    clearTimeout(currentCountdown.current);
  }

  const preloadNextExampleAudio = useCallback(
    (index: number) => {
      if (index < examplesToQuiz.length) {
        const nextExample = examplesToQuiz[index];
        if (preloadEnglishAudioRef.current) {
          preloadEnglishAudioRef.current.src = nextExample?.englishAudio;
          preloadEnglishAudioRef.current.load();
        }
        if (preloadSpanishAudioRef.current) {
          preloadSpanishAudioRef.current.src = nextExample?.spanishAudio;
          preloadSpanishAudioRef.current.load();
        }
      }
    },
    [examplesToQuiz],
  );

  // Skips to the next whole example
  const incrementExample = useCallback(() => {
    clearCountDown();
    pauseAudio();
    const nextExampleIndex = currentExampleIndex + 1;
    if (nextExampleIndex < examplesToQuiz?.length) {
      setCurrentExampleIndex(nextExampleIndex);

      preloadNextExampleAudio(nextExampleIndex + 1);
    } else {
      setCurrentExampleIndex(examplesToQuiz?.length - 1 || 0);
    }
    setCurrentStep('question');
  }, [
    currentExampleIndex,
    examplesToQuiz?.length,
    pauseAudio,
    preloadNextExampleAudio,
  ]);

  // Skips to the previous whole example
  const decrementExample = useCallback(
    (customDecrement: undefined | stepValues = undefined) => {
      clearCountDown();
      pauseAudio();
      if (currentExampleIndex > 0) {
        setCurrentExampleIndex(currentExampleIndex - 1);
      } else {
        setCurrentExampleIndex(0);
      }
      // This is a custom decrement for when using arrows causes decrementCurrentStep to go back one example
      if (customDecrement) {
        setCurrentStep(customDecrement);
      } else {
        setCurrentStep('question');
      }
    },
    [currentExampleIndex, pauseAudio],
  );

  // Steps the quiz forward
  const incrementCurrentStep = useCallback(() => {
    prevAudioRefDuration.current = audioRef.current?.duration || 0;
    clearCountDown();
    pauseAudio();

    switch (currentStep) {
      case 'question':
        if (autoplay) {
          setCurrentStep('guess');
        } else {
          setCurrentStep('hint');
        }
        break;
      case 'guess':
        setCurrentStep('hint');

        break;
      case 'hint':
        setCurrentStep('answer');
        break;
      case 'answer':
        incrementExample();
        // Proceed to next question
        break;
      default:
        console.error('Invalid currentStep value: ', currentStep);
    }
  }, [autoplay, currentStep, incrementExample, pauseAudio]);

  // Steps the quiz backwards
  const decrementCurrentStep = useCallback(() => {
    prevAudioRefDuration.current = audioRef.current?.duration || 0;
    clearCountDown();
    pauseAudio();

    switch (currentStep) {
      case 'question':
        decrementExample('answer');
        break;
      case 'guess':
        setCurrentStep('question');
        break;
      case 'hint':
        if (autoplay) {
          setCurrentStep('guess');
        } else {
          setCurrentStep('question');
        }
        break;
      case 'answer':
        setCurrentStep('hint');
        break;
      default:
        console.error('Invalid currentStep value: ', currentStep);
    }
  }, [autoplay, currentStep, decrementExample, pauseAudio]);

  const unReadyQuiz = useCallback(() => {
    setCurrentExampleIndex(0);
    setCurrentStep('question');
    if (autoplay) {
      clearCountDown();
    }
  }, [setCurrentExampleIndex, setCurrentStep]);

  // in charge of Autoplay loop & updating visual progress bar
  useEffect(() => {
    if (autoplay && initialQuizStart) {
      clearTimeout(currentCountdown.current);
      setIsPlaying(true);
      if (countdown !== 0 && currentCountdownLength.current !== 0) {
        currentCountdown.current = setTimeout(updateCountdown, 50);
      }
      if (countdown === 0) {
        incrementCurrentStep();
      }
    }
  }, [
    autoplay,
    countdown,
    incrementCurrentStep,
    initialQuizStart,
    quizReady,
    updateCountdown,
  ]);

  // Play Audio when step is taken
  useEffect(() => {
    playAudio();
  }, [currentStepValue, playAudio]);

  // when step taken, set currentStepValue accordingly
  useEffect(() => {
    if (autoplay) {
      setProgressStatus(0); // reset progress bar
    }
  }, [autoplay, currentStep, currentExample]);

  useEffect(() => {
    if (examplesToQuiz.length === 0) {
      unReadyQuiz();
    }
  });

  return {
    currentExample,
    currentStepValue,
    currentStep,
    incrementCurrentStep,
    decrementCurrentStep,
    isPlaying,
    pausePlayback,
    resumePlayback,
    countdown,
    progressStatus,
  };
}
