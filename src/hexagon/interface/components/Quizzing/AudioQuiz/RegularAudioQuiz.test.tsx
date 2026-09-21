import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockUseAudioQuiz,
  overrideMockUseAudioQuiz,
  resetMockUseAudioQuiz,
} from '@application/units/AudioQuiz/useAudioQuiz.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { AudioQuizType } from '@domain/audioQuizzing';
import { RegularAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz';
import { cleanup, render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/units/AudioQuiz/useAudioQuiz', () => ({
  useAudioQuiz: () => mockUseAudioQuiz,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

const examples: ExampleWithVocabulary[] =
  createMockExampleWithVocabularyList(3);

describe('regularAudioQuiz', () => {
  const audioQuizProps = {
    examplesToQuiz: examples,
    audioQuizType: AudioQuizType.Speaking,
    autoplay: false,
    ready: true,
    cleanupFunction: vi.fn(),
  };

  beforeEach(() => {
    resetMockUseAudioQuiz();
    resetMockUseStudentUiVersion();
    overrideMockUseAudioQuiz({
      currentExampleNumber: 1,
      quizLength: 3,
      currentStepValue: {
        ...mockUseAudioQuiz.currentStepValue!,
        displayText: 'Playing English',
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the redesigned screen for a v2 student', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    render(
      <MockAllProviders>
        <RegularAudioQuiz audioQuizProps={audioQuizProps} />
      </MockAllProviders>,
    );

    expect(screen.getAllByText('Custom Quiz').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 / 3').length).toBeGreaterThan(0);
  });

  it('keeps the legacy audio quiz for a v1 student', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });

    render(
      <MockAllProviders>
        <RegularAudioQuiz audioQuizProps={audioQuizProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText('Playing English')).toBeInTheDocument();
    expect(screen.queryByText('Custom Quiz')).not.toBeInTheDocument();
  });
});
