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
    setAutoplay,
    setAudioQuizType,
    selectedQuizLength,
    setSelectedQuizLength,
    availableQuizLengths,
  } = quizSetupOptions;

  return (
    <>
      <div className="menuRow">
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
      </div>
      <div className="menuRow">
        <ToggleSwitch
          id="autoplay"
          ariaLabel="Autoplay"
          label="Autoplay"
          checked={autoplay}
          onChange={() => setAutoplay(!autoplay)}
        />
      </div>
      <div className="menuRow">
        <label htmlFor="quizLength">
          <p>Number to Quiz:</p>
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
      </div>
    </>
  );
}
