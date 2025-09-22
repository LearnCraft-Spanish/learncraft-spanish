import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { AudioEngineProvider } from 'src/hexagon/composition/providers/AudioProvider';
import { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';
import { createMockExampleWithVocabularyList } from 'src/hexagon/testing/factories/exampleFactory';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AudioQuiz from './AudioQuiz';

/*       Testing Setup        */
const cleanupFunction = vi.fn();

const studentUserData = getAuthUserFromEmail('student-lcsp@fake.not')!;
const studentFlashcardDataObject = allStudentFlashcards.find(
  (student) => student.emailAddress === studentUserData?.email,
)?.studentFlashcardData;

const unknownAudioExamples = createMockExampleWithVocabularyList(5)();
const knownAudioExamples = createMockExampleWithVocabularyList(5)();

if (
  !studentFlashcardDataObject ||
  !unknownAudioExamples ||
  !knownAudioExamples
) {
  throw new Error('Could not set up test data');
}

describe.skip('component AudioQuiz', () => {
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
          <AudioQuiz
            audioQuizProps={{
              examplesToQuiz: unknownAudioExamples,
              audioQuizType: AudioQuizType.Speaking,
              autoplay: false,
              cleanupFunction,
              ready: true,
            }}
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
          <AudioQuiz
            audioQuizProps={{
              examplesToQuiz: unknownAudioExamples,
              audioQuizType: AudioQuizType.Speaking,
              autoplay: false,
              cleanupFunction,
              ready: true,
            }}
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
        <AudioQuiz
          audioQuizProps={{
            examplesToQuiz: unknownAudioExamples,
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            cleanupFunction,
            ready: true,
          }}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/Listen to audio/i)).toBeInTheDocument();
      });
    });
  });
  describe('cleanupFunction', () => {
    it('cleanupFunction is called when clicking "Back"', async () => {
      render(
        <AudioQuiz
          audioQuizProps={{
            examplesToQuiz: unknownAudioExamples,
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            cleanupFunction,
            ready: true,
          }}
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
        <AudioQuiz
          audioQuizProps={{
            examplesToQuiz: [knownAudioExamples[0]],
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            cleanupFunction,
            ready: true,
          }}
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
        <AudioQuiz
          audioQuizProps={{
            examplesToQuiz: unknownAudioExamples,
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            cleanupFunction,
            ready: true,
          }}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/listen to audio/i)).toBeInTheDocument();
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
        <AudioQuiz
          audioQuizProps={{
            examplesToQuiz: unknownAudioExamples,
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            cleanupFunction,
            ready: true,
          }}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      await waitFor(() => {
        expect(screen.queryByText(/listen to audio/i)).toBeInTheDocument();
      });
      act(() => {
        fireEvent.click(screen.getByText(/show spanish/i));
      });
      await waitFor(() => {
        expect(screen.queryByText(/guess/i)).not.toBeInTheDocument();
      });
    });
  });
});
