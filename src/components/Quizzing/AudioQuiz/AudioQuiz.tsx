import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import type { Flashcard } from 'src/types/interfaceDefinitions';
import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';
import AudioFlashcard from '../AudioQuiz/AudioFlashcard';
import AudioQuizButtons from '../AudioQuiz/AudioQuizButtons';
import QuizProgress from '../QuizProgress';
import 'src/App.css';
import '../AudioQuiz/AudioBasedReview.css';

interface StepValue {
  audio: string;
  text: string | JSX.Element;
  step: stepValues | '';
}

type stepValues = 'question' | 'guess' | 'hint' | 'answer';

interface AudioQuizProps {
  examplesToParse: Flashcard[];
  quizLength?: number;
  audioOrComprehension?: 'audio' | 'comprehension';
  autoplay: boolean;
  cleanupFunction: () => void;
  quizTitle: string;
  myFlashcardsQuiz?: boolean;
  incrementOnAdd?: boolean;
}

export default function AudioQuiz({
  examplesToParse,
  audioOrComprehension = 'comprehension',
  autoplay,
  cleanupFunction,
  quizLength,
  incrementOnAdd, // serves same perpose as myflashcardsquiz + autoplay? investigate and hopefully remove
  quizTitle,
  myFlashcardsQuiz = false,
}: AudioQuizProps) {
  const { activeStudentQuery } = useActiveStudent();

  const navigate = useNavigate();
  const isMainLocation = location.pathname.split('/').length < 2;

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
  // Memo to parse quiz examples
  const [displayOrder, setDisplayOrder] = useState(() => {
    const shuffledExamples = fisherYatesShuffle(examplesToParse);
    // This should be display orders (array of id's) rather than examples.
    if (quizLength) {
      return shuffledExamples.slice(0, quizLength);
    }
    return shuffledExamples;
  });
  const quizReady = useMemo(
    () => displayOrder.length > 0 && activeStudentQuery.isSuccess,
    [activeStudentQuery.isSuccess, displayOrder.length],
  );
  // Memo the current example
  // This will update whenever the currentExampleIndex changes
  const currentExample = useMemo((): Flashcard | undefined => {
    if (displayOrder.length > 0) {
      return displayOrder[currentExampleIndex];
    }
  }, [displayOrder, currentExampleIndex]);

  // New Step Handling Variables
  // Using a state to control the current step so the UI can update
  const [currentStep, setCurrentStep] = useState<stepValues>('question');
  // steps = ['question', 'guess', 'hint', 'answer']

  // Step Values for each: Will be derived from the current example
  const questionValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? {
            audio: currentExample?.englishAudio,
            text: 'Playing English!',
            step: 'question',
          }
        : {
            audio: currentExample?.spanishAudioLa,
            text: <em>Listen to Audio</em>,
            step: 'question',
          };
    }
    return { audio: '', text: '', step: '' };
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
            audio: currentExample?.spanishAudioLa,
            text: 'Playing Spanish!',
            step: 'hint',
          }
        : {
            audio: currentExample?.spanishAudioLa,
            text: currentExample?.spanishExample,
            step: 'hint',
          };
    }
    return { audio: '', text: '', step: 'hint' };
  }, [currentExample, currentStep, audioOrComprehension]);

  const answerValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? {
            audio: currentExample?.spanishAudioLa,
            text: currentExample.spanishExample,
            step: 'answer',
          }
        : {
            audio: '',
            text: currentExample?.englishTranslation,
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
    if (currentStep !== 'guess') {
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
  }, [autoplay, initialQuizStart, currentStep]);

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

  function audioElement() {
    return (
      <audio
        ref={audioRef}
        src={currentStepValue.audio}
        preload="auto"
        onLoadedMetadata={() => playAudio()}
      />
    );
  }
  // /*      Preloading Audio      */
  // function preloadAudioElement() {
  //   return (
  //     <div id="preloadingNextExampleAudio">
  //       <audio ref={preloadEnglishAudioRef} preload="auto"></audio>
  //       <audio ref={preloadSpanishAudioRef} preload="auto"></audio>
  //     </div>
  //   );
  // }
  const preloadNextExampleAudio = useCallback(
    (index: number) => {
      if (index < displayOrder.length) {
        const nextExample = displayOrder[index];
        if (preloadEnglishAudioRef.current) {
          preloadEnglishAudioRef.current.src = nextExample?.englishAudio;
          preloadEnglishAudioRef.current.load();
        }
        if (preloadSpanishAudioRef.current) {
          preloadSpanishAudioRef.current.src = nextExample?.spanishAudioLa;
          preloadSpanishAudioRef.current.load();
        }
      }
    },
    [displayOrder],
  );

  // Skips to the next whole example
  const incrementExample = useCallback(() => {
    clearCountDown();
    pauseAudio();
    const nextExampleIndex = currentExampleIndex + 1;
    if (nextExampleIndex < displayOrder?.length) {
      setCurrentExampleIndex(nextExampleIndex);

      preloadNextExampleAudio(nextExampleIndex + 1);
    } else {
      setCurrentExampleIndex(displayOrder?.length - 1 || 0);
    }
    setCurrentStep('question');
  }, [
    currentExampleIndex,
    displayOrder?.length,
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

  // Currently only used by previousStepButton
  function customIncrementCurrentStep(step: stepValues) {
    pauseAudio();
    if (step === currentStep) {
      playAudio();
    } else {
      setCurrentStep(step);
    }
  }

  const unReadyQuiz = useCallback(() => {
    setCurrentExampleIndex(0);
    setCurrentStep('question');
    if (autoplay) {
      clearCountDown();
    }
    // navigate('..');
    cleanupFunction();
    if (!isMainLocation) {
      navigate('..');
    }
  }, [autoplay, cleanupFunction, isMainLocation, navigate]);

  function onRemove() {
    // this is to update the total example numbers, remove the removed example from displayOrder, and reset the currentExampleIndex
    // setTotalExamplesNumber(totalExamplesNumber - 1);
    if (myFlashcardsQuiz) {
      const deletedExample = displayOrder.splice(currentExampleIndex, 1);
      const newDisplayOrder = displayOrder.filter(
        (example) => example !== deletedExample[0],
      );
      // decrementExample();
      setDisplayOrder(newDisplayOrder);
      setCurrentStep('question');
      if (currentExampleIndex === displayOrder.length) {
        decrementExample();
      }
    }
  }

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

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'd') {
        incrementExample();
      } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        decrementExample();
      } else if (event.key === 'ArrowUp' || event.key === 'w') {
        event.preventDefault();
        incrementCurrentStep();
      } else if (event.key === 'ArrowDown' || event.key === 's') {
        event.preventDefault();
        decrementCurrentStep();
      } else if (event.key === ' ') {
        if (autoplay) {
          event.preventDefault();
          if (isPlaying) {
            pausePlayback();
          } else {
            resumePlayback();
          }
        }
      }
    },
    [
      incrementExample,
      decrementExample,
      incrementCurrentStep,
      decrementCurrentStep,
      autoplay,
      isPlaying,
      resumePlayback,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (displayOrder.length === 0) {
      unReadyQuiz();
    }
  });

  return (
    <div className="quiz">
      {quizReady && (
        <>
          <div className="audioBox">
            <QuizProgress
              currentExampleNumber={currentExampleIndex + 1}
              totalExamplesNumber={displayOrder.length}
              quizTitle={quizTitle}
            />
            <AudioFlashcard
              currentExampleText={currentStepValue.text}
              incrementCurrentStep={incrementCurrentStep}
              autoplay={autoplay}
              progressStatus={progressStatus}
              pausePlayback={pausePlayback}
              resumePlayback={resumePlayback}
              isPlaying={isPlaying}
              currentExample={currentExample}
              isStudent={activeStudentQuery.data?.role === 'student'}
              currentStep={currentStep}
              incrementExample={incrementExample}
              incrementOnAdd={incrementOnAdd}
              onRemove={onRemove}
            />
            {/* Audio elements */}
            {audioElement()}
            <div id="preloadingNextExampleAudio">
              <audio ref={preloadEnglishAudioRef} preload="auto"></audio>
              <audio ref={preloadSpanishAudioRef} preload="auto"></audio>
            </div>
          </div>
          <AudioQuizButtons
            incrementCurrentStep={incrementCurrentStep}
            autoplay={autoplay}
            decrementExample={decrementExample}
            incrementExample={incrementExample}
            customIncrementCurrentStep={customIncrementCurrentStep}
            audioOrComprehension={audioOrComprehension}
            currentStep={currentStep}
            unReadyQuiz={unReadyQuiz}
          />
        </>
      )}
    </div>
  );
}
