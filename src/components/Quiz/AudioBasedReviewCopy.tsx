import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { Flashcard } from '../../interfaceDefinitions';
import { fisherYatesShuffle } from '../../functions/fisherYatesShuffle';
import { useActiveStudent } from '../../hooks/useActiveStudent';

import { useAudioExamples } from '../../hooks/useAudioExamples';
import { useProgramTable } from '../../hooks/useProgramTable';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { useUserData } from '../../hooks/useUserData';
import Loading from '../Loading';
import AudioFlashcard from '../AudioBasedReview/AudioFlashcard';
import AudioQuizButtons from '../AudioBasedReview/AudioQuizButtons';
import AudioQuizSetupMenu from '../AudioBasedReview/AudioQuizSetupMenu';
import NewQuizProgress from '../AudioBasedReview/NewQuizProgress';
import '../../App.css';
import '../AudioBasedReview/AudioBasedReview.css';

interface StepValue {
  audio: string;
  text: string | JSX.Element;
}

type stepValues = 'question' | 'guess' | 'hint' | 'answer';

interface AudioBasedReviewProps {
  examplesToParse: Flashcard[];
  quizLength: number;
  audioOrComprehension?: 'audio' | 'comprehension';
  autoplay: boolean;
  cleanupFunction: () => void;
}

export default function AudioBasedReviewCopy({
  examplesToParse,
  audioOrComprehension = 'comprehension',
  autoplay,
  cleanupFunction,
  quizLength,
}: AudioBasedReviewProps) {
  const { activeStudentQuery } = useActiveStudent();

  const navigate = useNavigate();
  const isMainLocation = location.pathname.split('/').length < 2;

  // Define data readiness for UI updates
  // const dataReady =
  //   userDataQuery.isSuccess &&
  //   activeStudentQuery.isSuccess &&
  //   programTableQuery.isSuccess &&
  //   audioExamplesQuery.isSuccess &&
  //   (userDataQuery.data?.isAdmin ||
  //     activeStudentQuery.data?.role === 'student' ||
  //     activeStudentQuery.data?.role === 'limited');
  // const isError =
  //   !dataReady &&
  //   (userDataQuery.isError ||
  //     programTableQuery.isError ||
  //     audioExamplesQuery.isError ||
  //     activeStudentQuery.isError);
  // const isLoading =
  //   !dataReady &&
  //   (activeStudentQuery.isLoading ||
  //     userDataQuery.isLoading ||
  //     programTableQuery.isLoading ||
  //     audioExamplesQuery.isLoading);
  // const unavailable = !dataReady && !isLoading && !isError;

  // Examples Table after: filtedBylessonId, shuffled
  // const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]) // This is the proper pattern for flat state
  const [currentExampleNumber, setCurrentExampleNumber] = useState<number>(0); // Array Index of displayed example

  // New Audio Handling
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevAudioRefDuration = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | undefined>(0);
  const currentCountdownLength = useRef<number>(0);
  const currentCountdown = useRef<any>(0);
  const [progressStatus, setProgressStatus] = useState<number>(0); // visual progress bar percentage (0-100)

  /* KNOWN BUGS:
    - When the user returns to the menu, the first change to autoplay causes
    the lesson filter to reset without displaying.
  */

  // Memo to parse quiz examples
  const displayOrder = useMemo((): Flashcard[] => {
    const shuffledExamples = fisherYatesShuffle(examplesToParse);
    // This should be display orders rather than examples.
    // Can be fixed later, probably not the source of existing bugs.
    return shuffledExamples.slice(0, quizLength - 1);
  }, [examplesToParse, quizLength]);
  const quizReady = useMemo(
    () => displayOrder.length > 0 && activeStudentQuery.isSuccess,
    [activeStudentQuery.isSuccess, displayOrder.length],
  );
  // Memo the current example
  // This will update whenever the currentExampleNumber changes
  const currentExample = useMemo((): Flashcard | undefined => {
    if (displayOrder.length > 0) {
      return displayOrder[currentExampleNumber];
    }
  }, [displayOrder, currentExampleNumber]);

  // New Step Handling Variables
  // Using a state to control the current step so the UI can update
  const [currentStep, setCurrentStep] = useState<stepValues>('question');
  // const steps = ['question', 'guess', 'hint', 'answer']

  // Step Values for each: Will be derived from the current example
  const questionValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? { audio: currentExample?.englishAudio, text: 'Playing English!' }
        : {
            audio: currentExample?.spanishAudioLa,
            text: <em>Listen to Audio</em>,
          };
    }
    return { audio: '', text: '' };
  }, [currentExample, currentStep, audioOrComprehension]);

  const guessValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return { audio: '', text: 'Make a guess!' };
    }
    return { audio: '', text: '' };
  }, [currentExample, currentStep]);

  const hintValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? { audio: currentExample?.spanishAudioLa, text: 'Playing Spanish!' }
        : {
            audio: currentExample?.spanishAudioLa,
            text: currentExample?.spanishExample,
          };
    }
    return { audio: '', text: '' };
  }, [currentExample, currentStep, audioOrComprehension]);

  const answerValue = useMemo((): StepValue => {
    if (currentExample && currentStep) {
      return audioOrComprehension === 'audio'
        ? {
            audio: currentExample?.spanishAudioLa,
            text: currentExample.spanishExample,
          }
        : { audio: '', text: currentExample?.englishTranslation };
    }
    return { audio: '', text: '' };
  }, [currentExample, currentStep, audioOrComprehension]);

  // Get the value of the current step programmatically
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
    } else if (currentCountdownLength.current > 0) {
      setCountdown(0);
    } else {
      setCountdown(undefined);
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

  /*       New Audio Handling     */
  const playAudio = useCallback(() => {
    // add catch for when audio not supported (url is empty)
    if (autoplay) {
      if (audioRef.current?.duration) {
        const currentDuration = audioRef.current.duration;
        startCountdown(currentDuration + 1.5);
      } else {
        if (prevAudioRefDuration.current) {
          startCountdown(prevAudioRefDuration.current + 1.5);
        }
      }
    }
    if (audioRef.current?.duration) {
      audioRef.current.play().catch((e: unknown) => {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error('Error playing audio. Error: ', e);
        }
      });
    }
  }, [autoplay]);

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
        onLoadedMetadata={() => {
          playAudio();
        }}
      ></audio>
    );
  }

  // Skips to the next whole example
  const incrementExample = useCallback(() => {
    if (currentExampleNumber + 1 < displayOrder?.length) {
      setCurrentExampleNumber(currentExampleNumber + 1);
    } else {
      setCurrentExampleNumber(displayOrder?.length - 1 || 0);
    }
    setCurrentStep('question');
  }, [currentExampleNumber, displayOrder]);

  // Skips to the previous whole example
  const decrementExample = useCallback(
    (customDecrement: undefined | stepValues = undefined) => {
      if (currentExampleNumber > 0) {
        setCurrentExampleNumber(currentExampleNumber - 1);
      } else {
        setCurrentExampleNumber(0);
      }
      // This is a custom decrement for using arrows causes decrementCurrentStep to go back one example
      if (customDecrement) {
        setCurrentStep(customDecrement);
      } else {
        setCurrentStep('question');
      }
    },
    [currentExampleNumber],
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
    setCurrentExampleNumber(0);
    setCurrentStep('question');
    if (autoplay) {
      clearCountDown();
    }
    navigate('..');
    cleanupFunction();
    if (isMainLocation) {
      navigate('..');
    }
  }, [autoplay, cleanupFunction, isMainLocation, navigate]);

  // Stop Countdown on Dismount
  // useEffect(() => clearCountDown(), []);

  // in charge of controlling progress bar updating
  useEffect(() => {
    if (autoplay && quizReady) {
      clearTimeout(currentCountdown.current);
      if (countdown !== 0 && currentCountdownLength.current !== 0) {
        currentCountdown.current = setTimeout(updateCountdown, 50);
      }
      if (countdown === 0 && isPlaying === true) {
        console.log('incrementing step');
        incrementCurrentStep();
      }
      setIsPlaying(true);
    }
  }, [
    autoplay,
    countdown,
    displayOrder,
    incrementCurrentStep,
    isPlaying,
    quizReady,
    updateCountdown,
  ]);

  // Play Audio when step is taken
  useEffect(() => playAudio(), [currentStepValue, playAudio]);

  // when step taken, set currentStepValue accordingly
  useEffect(() => {
    if (autoplay) {
      setProgressStatus(0); // reset progress bar
    }
  }, [autoplay, currentStep]);

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

  return (
    <div className="quiz">
      {quizReady && (
        <>
          <div className="audioBox">
            <NewQuizProgress
              currentExampleNumber={currentExampleNumber + 1}
              totalExamplesNumber={displayOrder.length}
              quizTitle={'My Audio Flashcards'}
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
              incrementExample={incrementExample}
              isStudent={activeStudentQuery.data?.role === 'student'}
              currentStep={currentStep}
            />
            {audioElement()}
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
