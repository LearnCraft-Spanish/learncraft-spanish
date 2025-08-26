import type { QuizSetupOptions } from '@application/useCases/useQuizMyFlashcards';
import { MenuButton, ToggleSwitch } from '@interface/components/general';

import React, { useMemo } from 'react';

import './QuizSetupMenu.scss';

interface QuizSetupMenuProps {
  quizSetupOptions: QuizSetupOptions;
  startQuiz: () => void;
}
export default function QuizSetupMenu({
  quizSetupOptions,
  startQuiz,
}: QuizSetupMenuProps) {
  const {
    availableFlashcards,
    maximumQuizLength,
    hasCustomFlashcards,

    quizSettings,
    updateQuizSettings,
  } = quizSetupOptions;

  const {
    quizType,
    quizLength,
    startWithSpanish,
    srsQuiz,
    customOnly,
    audioQuizVariant,
    autoplay,
  } = quizSettings;

  const calculateQuizLengthOptions = useMemo(() => {
    // Calculate quiz length options
    const quizLengthOptions = [];
    if (availableFlashcards.length > 5) {
      for (let i = 5; i < maximumQuizLength; i = i * 2) {
        quizLengthOptions.push(i);
      }
    }
    quizLengthOptions.push(maximumQuizLength);
    return quizLengthOptions;
  }, [availableFlashcards, maximumQuizLength]);

  return (
    <form
      className="myFlashcardsForm"
      onSubmit={(e) => {
        console.error(
          'QuizSetupMenu form submitted. was this supposted to happen?',
        );
        e.preventDefault();
      }}
    >
      <div className="myFlashcardsFormContentWrapper">
        <h3>Review My Flashcards</h3>
        <h4>Quiz Type:</h4>
        <div className="buttonBox header">
          <input type="radio" id="quizType" value="text" name="quizType" />
          <label
            htmlFor="quizType"
            className={quizType === 'text' ? 'selected' : ''}
            onClick={() => updateQuizSettings('quizType', 'text')}
          >
            Text
          </label>
          <input type="radio" id="audio" value="audio" name="quizType" />
          <label
            htmlFor="audio"
            className={quizType === 'audio' ? 'selected' : ''}
            onClick={() => updateQuizSettings('quizType', 'audio')}
          >
            Audio
          </label>
        </div>
        {quizType === 'text' && (
          <div className="quizTypeSettingsWrapper">
            <ToggleSwitch
              id="spanishFirst"
              ariaLabel="Start with Spanish"
              label="Start with Spanish"
              checked={startWithSpanish}
              onChange={() =>
                updateQuizSettings('startWithSpanish', !startWithSpanish)
              }
            />
            <ToggleSwitch
              id="srsQuiz"
              ariaLabel="SRS Quiz"
              label="SRS Quiz"
              checked={srsQuiz}
              onChange={() => updateQuizSettings('srsQuiz', !srsQuiz)}
            />
          </div>
        )}
        {quizType === 'audio' && (
          <div className="quizTypeSettingsWrapper">
            <ToggleSwitch
              id="isListening"
              ariaLabel="Listening Quiz"
              label="Listening Quiz"
              checked={audioQuizVariant === 'listening'}
              onChange={() =>
                updateQuizSettings(
                  'audioQuizVariant',
                  audioQuizVariant === 'listening' ? 'speaking' : 'listening',
                )
              }
            />
            <ToggleSwitch
              id="autoplay"
              ariaLabel="Autoplay"
              label="Autoplay"
              checked={autoplay}
              onChange={() => updateQuizSettings('autoplay', !autoplay)}
            />
          </div>
        )}
        {hasCustomFlashcards && (
          <div className="QuizMenuCustomOnly">
            <ToggleSwitch
              id="customOnly"
              ariaLabel="Custom Only"
              label="Custom Only"
              checked={customOnly}
              onChange={() => updateQuizSettings('customOnly', !customOnly)}
            />
          </div>
        )}
        <label htmlFor="quizLength">
          <p>Number of Flashcards:</p>
          <select
            name="length"
            id="quizLength"
            onChange={(e) =>
              updateQuizSettings('quizLength', Number.parseInt(e.target.value))
            }
            value={quizLength}
          >
            {calculateQuizLengthOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="buttonBox">
        <button type="submit" disabled={quizLength === 0} onClick={startQuiz}>
          Start Quiz
        </button>
      </div>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </form>
  );
}
