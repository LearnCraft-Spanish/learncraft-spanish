import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import { AudioQuizType } from '@domain/audioQuizzing';

import { ToggleSwitch } from '@interface/components/general';

import { InlineLoading } from '@interface/components/Loading';
import React from 'react';

import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import '@interface/styles/QuizSetupMenu.scss';

export function AudioQuizMenu({
  quizSetupOptions,
  filteringIsLoading = false,
  totalCount,
}: {
  filteringIsLoading?: boolean;
  quizSetupOptions: AudioQuizSetupReturn;
  totalCount?: number | null;
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
    <div className="quizSettingsBody">
      <label className="menuRow dropdown">
        Quiz Type:
        <select
          value={audioQuizType}
          onChange={(e) => setAudioQuizType(e.target.value as AudioQuizType)}
        >
          <option value={AudioQuizType.Speaking.toString()}>Speaking</option>
          <option value={AudioQuizType.Listening.toString()}>Listening</option>
        </select>
      </label>
      <div className="menuRow">
        <ToggleSwitch
          id="autoplay"
          ariaLabel="Autoplay"
          label="Autoplay"
          checked={autoplay}
          onChange={() => setAutoplay(!autoplay)}
        />
      </div>
      {filteringIsLoading ? (
        <InlineLoading message="Filtering examples..." />
      ) : (
        <>
          <label className="menuRow dropdown">
            Quiz Length:
            <select
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
          <div className="quizSettingsBody">
            <div className="menuRow">
              <p className="totalCount">{`${totalCount ?? 0} examples found`}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
