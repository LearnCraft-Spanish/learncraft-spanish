import type { FlashcardDisplayProps } from './FlashcardDisplay.types';
import AudioControl from '@interface/components/general/AudioControl/AudioControl';
import React from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { AddToMyFlashcardsButtons } from '../AddToMyFlashcardsButtons';
import './FlashcardDisplay.scss';

export function FlashcardDisplay({
  quizExample,
  answerShowing,
  addFlashcard,
  removeFlashcard,
  toggleAnswer,
}: FlashcardDisplayProps) {
  if (!quizExample) {
    return <p>Example not found</p>;
  }
  const {
    question,
    answer,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
  } = quizExample;
  const audioActive =
    (answerShowing && answer.hasAudio) || (!answerShowing && question.hasAudio);
  const audioUrl =
    answerShowing && answer.hasAudio
      ? answer.audioUrl
      : question.hasAudio
        ? question.audioUrl
        : null;

  const questionText = () =>
    question.spanish
      ? formatSpanishText(question.text)
      : formatEnglishText(question.text);
  const answerText = () =>
    answer.spanish
      ? formatSpanishText(answer.text)
      : formatEnglishText(answer.text);

  return (
    <div className="flashcard" onClick={toggleAnswer} aria-label="flashcard">
      {!answerShowing && (
        <div
          className={`${question.spanish ? 'spanishExample' : 'englishTranslation'}`}
        >
          {questionText()}
        </div>
      )}
      {answerShowing && (
        <div
          className={`${answer.spanish ? 'spanishExample' : 'englishTranslation'}`}
        >
          {answerText()}
          <AddToMyFlashcardsButtons
            exampleIsCollected={exampleIsCollected}
            exampleIsCustom={exampleIsCustom}
            exampleIsPending={exampleIsPending}
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}
          />
        </div>
      )}

      {/* Click to flip */}
      <div
        className={`clickToFlipMessage ${audioActive ? 'flashcardWithAudio' : ''}`}
      >
        <b>Click to flip</b>
      </div>

      {/* Play/Pause */}
      {audioUrl && (
        <div
          className="audioControlContainer"
          onClick={(e) => e.stopPropagation()}
        >
          <AudioControl audioLink={audioUrl} />
        </div>
      )}
    </div>
  );
}
