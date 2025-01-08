import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { setupMockAuth } from '../../../../tests/setupMockAuth';
import MockAllProviders from '../../../../mocks/Providers/MockAllProviders';
import serverlikeData from '../../../../mocks/data/serverlike/serverlikeData';
import { getUserDataFromName } from '../../../../mocks/data/serverlike/studentTable';
import allStudentFlashcards from '../../../../mocks/data/hooklike/studentFlashcardData';
import AudioQuiz from './AudioQuiz';

/*       Testing Setup        */
const cleanupFunction = vi.fn();

const studentUserData = getUserDataFromName('student-lcsp');
const studentFlashcardDataObject = allStudentFlashcards.find(
  (student) => student.userName === studentUserData?.name,
)?.studentFlashcardData;

const audioExamplesTable = serverlikeData().api.audioExamplesTable;
const unknownAudioExamples = audioExamplesTable
  .filter((example) => {
    return !studentFlashcardDataObject?.examples.includes(example);
  })
  .slice(0, 5);
const knownAudioExamples = studentFlashcardDataObject?.examples
  .filter((example) => {
    return example.englishAudio && example.spanishAudioLa;
  })
  .slice(0, 5);

if (
  !studentFlashcardDataObject ||
  !unknownAudioExamples ||
  !knownAudioExamples
) {
  throw new Error('Could not set up test data');
}

/*
  Known Issues With Testing:
  unable to test the following:
  - clearing the ExamplesToParse array down to 0, which would trigger the cleanupFunction
    - Better approach is probably to test this in a parent component.
*/
describe('component AudioQuiz', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('renders without crashing', async () => {
      render(
        <AudioQuiz
          quizTitle={'Test Quiz'}
          examplesToParse={unknownAudioExamples}
          cleanupFunction={cleanupFunction}
          autoplay={false}
        />,
        {
          wrapper: MockAllProviders,
        },
      );
      const progressBarText = `1/${unknownAudioExamples.length}`;
      await waitFor(() => {
        expect(screen.queryByText('Test Quiz')).toBeInTheDocument();
        expect(screen.queryByText(progressBarText)).toBeInTheDocument();
      });
    });
  });
  describe('audioOrComprehension', () => {
    it('audioOrComprehension is audio, questionValueText is "Playing English"', async () => {
      render(
        <AudioQuiz
          quizTitle={'Test Quiz'}
          examplesToParse={unknownAudioExamples}
          cleanupFunction={cleanupFunction}
          autoplay={false}
          audioOrComprehension="audio"
        />,
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
          quizTitle={'Test Quiz'}
          examplesToParse={unknownAudioExamples}
          cleanupFunction={cleanupFunction}
          autoplay={false}
          audioOrComprehension="comprehension"
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
          quizTitle={'Test Quiz'}
          examplesToParse={unknownAudioExamples}
          cleanupFunction={cleanupFunction}
          autoplay={false}
          audioOrComprehension="audio"
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
          quizTitle={'Test Quiz'}
          examplesToParse={[knownAudioExamples[0]]}
          cleanupFunction={cleanupFunction}
          autoplay={false}
          myFlashcardsQuiz
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
          quizTitle={'Test Quiz'}
          examplesToParse={unknownAudioExamples}
          cleanupFunction={cleanupFunction}
          autoplay
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
          quizTitle={'Test Quiz'}
          examplesToParse={unknownAudioExamples}
          cleanupFunction={cleanupFunction}
          autoplay={false}
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
