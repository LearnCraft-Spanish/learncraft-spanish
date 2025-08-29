import { cleanup, render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { sampleStudentFlashcardData } from 'tests/mockData';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FlashcardDisplay } from './FlashcardDisplay';

const example = {
  ...sampleStudentFlashcardData.examples[0],
  isCollected: true,
};
const audioExample = sampleStudentFlashcardData.examples.filter(
  (example) => example.spanishAudioLa.length,
)[0];

const addFlashcard = vi.fn(() => {});
const removeFlashcard = vi.fn(() => {});
const toggleAnswer = vi.fn();
const togglePlaying = vi.fn();

// Helper function to transform old example format to new FlashcardForDisplay format
function createQuizExample(
  example: (typeof sampleStudentFlashcardData.examples)[0],
  startWithSpanish: boolean,
  isStudent: boolean = true,
) {
  const question = startWithSpanish
    ? {
        spanish: true,
        text: example.spanishExample,
        hasAudio: !!example.spanishAudioLa,
        audioUrl: example.spanishAudioLa || '',
      }
    : {
        spanish: false,
        text: example.englishTranslation,
        hasAudio: !!example.englishAudio,
        audioUrl: example.englishAudio || '',
      };

  const answer = startWithSpanish
    ? {
        spanish: false,
        text: example.englishTranslation,
        hasAudio: !!example.englishAudio,
        audioUrl: example.englishAudio || '',
        owned: isStudent,
        addFlashcard: () => addFlashcard(),
        removeFlashcard: () => removeFlashcard(),
        vocabComplete: example.vocabComplete,
        vocabulary: [],
        updateFlashcardInterval: vi.fn(),
      }
    : {
        spanish: true,
        text: example.spanishExample,
        hasAudio: !!example.spanishAudioLa,
        audioUrl: example.spanishAudioLa || '',
        owned: isStudent,
        addFlashcard: () => addFlashcard(),
        removeFlashcard: () => removeFlashcard(),
        vocabComplete: example.vocabComplete,
        vocabulary: [],
        updateFlashcardInterval: vi.fn(),
      };

  return {
    question,
    answer,
    exampleIsCollected: (example as any).isCollected || false,
    exampleIsCustom: false,
    exampleIsPending: false,
  };
}

function FlashcardSpanishFirst() {
  const quizExample = createQuizExample(example, true, true);
  return (
    <MockAllProviders>
      <FlashcardDisplay
        quizExample={quizExample}
        answerShowing={false}
        addFlashcard={addFlashcard}
        removeFlashcard={removeFlashcard}
        toggleAnswer={toggleAnswer}
        togglePlaying={togglePlaying}
        playing={false}
      />
    </MockAllProviders>
  );
}
function FlashcardEnglishFirst() {
  const quizExample = createQuizExample(example, false, true);
  return (
    <MockAllProviders>
      <FlashcardDisplay
        quizExample={quizExample}
        answerShowing={false}
        addFlashcard={addFlashcard}
        removeFlashcard={removeFlashcard}
        toggleAnswer={toggleAnswer}
        togglePlaying={togglePlaying}
        playing={false}
      />
    </MockAllProviders>
  );
}
function FlashcardSpanishFirstAnswerShowing() {
  const quizExample = createQuizExample(example, true, true);
  return (
    <MockAllProviders>
      <FlashcardDisplay
        quizExample={quizExample}
        answerShowing
        addFlashcard={addFlashcard}
        removeFlashcard={removeFlashcard}
        toggleAnswer={toggleAnswer}
        togglePlaying={togglePlaying}
        playing={false}
      />
    </MockAllProviders>
  );
}
function FlashcardEnglishFirstAnswerShowing() {
  const quizExample = createQuizExample(example, false, true);
  return (
    <MockAllProviders>
      <FlashcardDisplay
        quizExample={quizExample}
        answerShowing
        addFlashcard={addFlashcard}
        removeFlashcard={removeFlashcard}
        toggleAnswer={toggleAnswer}
        togglePlaying={togglePlaying}
        playing={false}
      />
    </MockAllProviders>
  );
}

function FlashcardSpanishFirstNotStudent() {
  const quizExample = createQuizExample(example, true, false);
  return (
    <MockAllProviders>
      <FlashcardDisplay
        quizExample={quizExample}
        answerShowing={false}
        addFlashcard={addFlashcard}
        removeFlashcard={removeFlashcard}
        toggleAnswer={toggleAnswer}
        togglePlaying={togglePlaying}
        playing={false}
      />
    </MockAllProviders>
  );
}

function FlashcardWithAudio() {
  const quizExample = createQuizExample(audioExample, true, true);
  return (
    <MockAllProviders>
      <FlashcardDisplay
        quizExample={quizExample}
        answerShowing={false}
        addFlashcard={addFlashcard}
        removeFlashcard={removeFlashcard}
        toggleAnswer={toggleAnswer}
        togglePlaying={togglePlaying}
        playing={false}
      />
    </MockAllProviders>
  );
}

describe('component Flashcard', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('on click, calls toggle answer', () => {
    render(<FlashcardSpanishFirst />);
    // toggleAnswer()
    const flashcard = screen.getByText(example.spanishExample);
    act(() => {
      flashcard.click();
    });
    expect(toggleAnswer).toHaveBeenCalled();
  });

  describe('audio is active', () => {
    it('renders correctly', () => {
      render(<FlashcardWithAudio />);
      expect(screen.getAllByLabelText('Play/Pause')).toBeTruthy();
    });
    it('on click, calls togglePlaying', () => {
      render(<FlashcardWithAudio />);
      const playPause = screen.getAllByLabelText('Play/Pause')[0];
      act(() => {
        playPause.click();
      });
      expect(togglePlaying).toHaveBeenCalled();
    });
    it('on click, does NOT propagate to also call toggleAnswer', () => {
      render(<FlashcardWithAudio />);
      const playPause = screen.getAllByLabelText('Play/Pause')[0];
      act(() => {
        playPause.click();
      });
      expect(toggleAnswer).not.toHaveBeenCalled();
    });
  });

  describe('answer showing is false', () => {
    it('renders correctly, spanish shown first', () => {
      render(<FlashcardSpanishFirst />);
      expect(screen.getByText(example.spanishExample)).toBeTruthy();
      expect(screen.queryByText(example.englishTranslation)).toBeNull();
    });
    it('renders correctly, english shown first', () => {
      render(<FlashcardEnglishFirst />);
      expect(screen.getByText(example.englishTranslation)).toBeTruthy();
      expect(screen.queryByText(example.spanishExample)).toBeNull();
    });
    it('on click, calls toggleAnswer function', () => {
      render(<FlashcardSpanishFirst />);
      const flashcard = screen.getByText(example.spanishExample);
      act(() => {
        flashcard.click();
      });
      expect(toggleAnswer).toHaveBeenCalled();
    });
  });

  describe('answer showing is true', () => {
    it('renders correctly, spanish first', () => {
      render(<FlashcardSpanishFirstAnswerShowing />);
      expect(screen.getByText(example.englishTranslation)).toBeTruthy();
      expect(screen.queryByText(example.spanishExample)).toBeNull();
    });
    it('renders correctly, english first', () => {
      render(<FlashcardEnglishFirstAnswerShowing />);
      expect(screen.getByText(example.spanishExample)).toBeTruthy();
      expect(screen.queryByText(example.englishTranslation)).toBeNull();
    });
    describe('isStudent is false', () => {
      it('add and remove flashcard buttons are not rendered', () => {
        render(<FlashcardSpanishFirstNotStudent />);
        expect(screen.queryByText('Add to my flashcards')).toBeNull();
        expect(screen.queryByText('Remove from my flashcards')).toBeNull();
      });
    });
  });
});
