import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import { ToggleSwitch } from '@interface/components/general';

import React from 'react';

import { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';
import './QuizSetupMenu.scss';

export function MyAudioQuizMenu({
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
        <ToggleSwitch
          id="isListening"
          ariaLabel="Listening Quiz"
          label="Listening Quiz"
          checked={audioQuizType === AudioQuizType.Listening}
          onChange={() =>
            setAudioQuizType(
              audioQuizType === AudioQuizType.Listening
                ? AudioQuizType.Speaking
                : AudioQuizType.Listening,
            )
          }
        />
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
