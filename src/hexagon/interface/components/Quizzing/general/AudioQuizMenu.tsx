import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import { ToggleSwitch } from '@interface/components/general';

import React from 'react';

import { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';
import './QuizSetupMenu.scss';

export function AudioQuizMenu({
  quizSetupOptions,
}: {
  quizSetupOptions: AudioQuizSetupReturn;
}) {
  const {
    audioQuizType,
    autoplay,
    totalExamples,
    setAutoplay,
    setAudioQuizType,
    selectedQuizLength,
    setSelectedQuizLength,
    availableQuizLengths,
  } = quizSetupOptions;

  return (
    <>
      <div className="quizTypeSettingsWrapper">
        <label htmlFor="isListening">Quiz Type:</label>
        <select
          id="quizType"
          aria-label="Listening Quiz"
          value={audioQuizType}
          onChange={(e) => setAudioQuizType(e.target.value as AudioQuizType)}
        >
          <option value={AudioQuizType.Speaking.toString()}>Speaking</option>
          <option value={AudioQuizType.Listening.toString()}>Listening</option>
        </select>
        <ToggleSwitch
          id="autoplay"
          ariaLabel="Autoplay"
          label="Autoplay"
          checked={autoplay}
          onChange={() => setAutoplay(!autoplay)}
        />
      </div>
      <label htmlFor="quizLength">
        <p>Number of Flashcards:</p>
        <select
          name="length"
          id="quizLength"
          onChange={(e) =>
            setSelectedQuizLength(Number.parseInt(e.target.value))
          }
          value={selectedQuizLength}
        >
          {availableQuizLengths.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <p>{`${totalExamples} examples found`}</p>
    </>
  );
}
