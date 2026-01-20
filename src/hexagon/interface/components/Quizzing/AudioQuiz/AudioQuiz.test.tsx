import type { AudioQuizReturn } from '@application/units/AudioQuiz/useAudioQuiz';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createMockStepValue } from '@application/units/AudioQuiz/useAudioQuiz.mock';
import { AudioEngineProvider } from '@composition/providers/AudioProvider';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/*       Testing Setup        */
const cleanupFunction = vi.fn();

const studentUserData = getAuthUserFromEmail('student-lcsp@fake.not')!;
const studentFlashcardDataObject = allStudentFlashcards.find(
  (student) => student.emailAddress === studentUserData?.email,
)?.studentFlashcardData;

const unknownAudioExamples = createMockExampleWithVocabularyList(5);
const knownAudioExamples = createMockExampleWithVocabularyList(5);

if (
  !studentFlashcardDataObject ||
  !unknownAudioExamples ||
  !knownAudioExamples
) {
  throw new Error('Could not set up test data');
}

// Mock wrapper component that creates AudioQuizReturn
function MockAudioQuizWrapper({
  examplesToQuiz,
  audioQuizType,
  autoplay,
  customCleanup,
}: {
  examplesToQuiz: ExampleWithVocabulary[];
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  customCleanup?: () => void;
}) {
  const [currentExampleIndex, setCurrentExampleIndex] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(AudioQuizStep.Question);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isQuizComplete, setIsQuizComplete] = React.useState(false);
  const [getHelpIsOpen, setGetHelpIsOpen] = React.useState(false);

  const currentExample = examplesToQuiz[currentExampleIndex];
  const quizLength = examplesToQuiz.length;

  const nextExample = () => {
    if (currentExampleIndex < quizLength - 1) {
      setCurrentExampleIndex(currentExampleIndex + 1);
      setCurrentStep(AudioQuizStep.Question);
      setIsPlaying(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const previousExample = () => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex(currentExampleIndex - 1);
      setCurrentStep(AudioQuizStep.Question);
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (currentStep === AudioQuizStep.Question) {
      setCurrentStep(autoplay ? AudioQuizStep.Guess : AudioQuizStep.Answer);
    } else if (currentStep === AudioQuizStep.Guess) {
      setCurrentStep(AudioQuizStep.Hint);
    } else if (currentStep === AudioQuizStep.Hint) {
      setCurrentStep(AudioQuizStep.Answer);
    }
  };

  const goToQuestion = () => setCurrentStep(AudioQuizStep.Question);
  const goToGuess = () => setCurrentStep(AudioQuizStep.Guess);
  const goToHint = () => setCurrentStep(AudioQuizStep.Hint);
  const goToAnswer = () => setCurrentStep(AudioQuizStep.Answer);

  const restartCurrentStep = () => {
    setIsPlaying(false);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  const restartQuiz = () => {
    setCurrentExampleIndex(0);
    setCurrentStep(AudioQuizStep.Question);
    setIsPlaying(false);
    setIsQuizComplete(false);
  };

  // Create mock step value using the mock helper
  const currentStepValue = createMockStepValue(
    currentStep,
    currentExample,
    audioQuizType,
  );

  const audioQuizReturn: AudioQuizReturn = {
    autoplay,
    audioQuizType,
    currentExampleNumber: currentExampleIndex + 1,
    currentExample,
    currentExampleReady: true,
    currentStep,
    currentStepValue,
    nextExampleReady: currentExampleIndex < quizLength - 1,
    previousExampleReady: currentExampleIndex > 0,
    progressStatus: 0,
    isPlaying,
    pause,
    play,
    nextStep,
    goToQuestion,
    goToGuess,
    goToHint,
    goToAnswer,
    restartCurrentStep,
    nextExample,
    previousExample,
    quizLength,
    cleanupFunction: customCleanup || cleanupFunction,
    isQuizComplete,
    restartQuiz,
    getHelpIsOpen,
    setGetHelpIsOpen,
    vocabComplete: currentExample?.vocabularyComplete ?? false,
    vocabulary: currentExample?.vocabulary ?? [],
    addPendingRemoveProps: undefined,
  };

  return <AudioQuiz audioQuizReturn={audioQuizReturn} />;
}

describe('component AudioQuiz', () => {
  beforeEach(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('renders without crashing', async () => {
      render(
        <AudioEngineProvider>
          <MockAudioQuizWrapper
            examplesToQuiz={unknownAudioExamples}
            audioQuizType={AudioQuizType.Speaking}
            autoplay={false}
          />
        </AudioEngineProvider>,
        {
          wrapper: MockAllProviders,
        },
      );
      const progressBarText = `1 of ${unknownAudioExamples.length}`;
      await waitFor(() => {
        expect(screen.queryByText(progressBarText)).toBeInTheDocument();
      });
    });
  });
  describe('audioOrComprehension', () => {
    it('audioOrComprehension is audio, questionValueText is "Playing English"', async () => {
      render(
        <AudioEngineProvider>
          <MockAudioQuizWrapper
            examplesToQuiz={unknownAudioExamples}
            audioQuizType={AudioQuizType.Speaking}
            autoplay={false}
          />
        </AudioEngineProvider>,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/Playing English/i)).toBeInTheDocument();
      });
    });
    it('audioOrComprehension is comprehension, questionValueText is "Listen to audio"', async () => {
      render(
        <MockAudioQuizWrapper
          examplesToQuiz={unknownAudioExamples}
          audioQuizType={AudioQuizType.Speaking}
          autoplay={false}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/playing english/i)).toBeInTheDocument();
      });
    });
  });
  describe('cleanupFunction', () => {
    it('cleanupFunction is called when clicking "Back"', async () => {
      render(
        <MockAudioQuizWrapper
          examplesToQuiz={unknownAudioExamples}
          audioQuizType={AudioQuizType.Speaking}
          autoplay={false}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText('Back')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Back'));
      await waitFor(() => {
        expect(cleanupFunction).toHaveBeenCalled();
      });
    });
    it.skip('cleanupFunction is called when all flashcards are removed from quiz', async () => {
      // LOOK AT KNOWN ISSUES COMMENT AT TOP OF FILE, MOVE THIS TO A PARENT COMPONENT TEST
      // This will happen when:
      // 1. ReviewMyFlashcards Audio Quiz, all flashcards are removed
      render(
        <MockAudioQuizWrapper
          examplesToQuiz={[knownAudioExamples[0]]}
          audioQuizType={AudioQuizType.Speaking}
          autoplay={false}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText('Test Quiz')).toBeInTheDocument();
      });
      act(() => {
        // in current implementation, this is the button for a comprehension quiz (default audioOrComprehension value, autoplay=false) to go to next step
        fireEvent.click(screen.getByText('Show Spanish'));
      });
      await waitFor(() => {
        expect(
          screen.queryByText(/remove from my flashcards/i),
        ).toBeInTheDocument();
      });
      act(() => {
        fireEvent.click(screen.getByText(/remove from my flashcards/i));
      });
      await waitFor(() => {
        expect(screen.queryByText('Test Quiz')).not.toBeInTheDocument();
      });
    });
  });
  describe('autoplay', () => {
    it('autoplay is true, 2nd step is guess', async () => {
      render(
        <MockAudioQuizWrapper
          examplesToQuiz={unknownAudioExamples}
          audioQuizType={AudioQuizType.Speaking}
          autoplay
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/Playing English/i)).toBeInTheDocument();
      });
      act(() => {
        fireEvent.click(screen.getByText(/skip to guess/i));
      });
      await waitFor(() => {
        expect(screen.queryByText(/make a guess/i)).toBeInTheDocument();
      });
    });
    it('autoplay is false, 2nd step is NOT guess', async () => {
      render(
        <MockAudioQuizWrapper
          examplesToQuiz={unknownAudioExamples}
          audioQuizType={AudioQuizType.Speaking}
          autoplay={false}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/Playing English/i)).toBeInTheDocument();
      });
      act(() => {
        fireEvent.click(screen.getByText(/play spanish/i));
      });
      await waitFor(() => {
        expect(screen.queryByText(/guess/i)).not.toBeInTheDocument();
      });
    });
  });
});
