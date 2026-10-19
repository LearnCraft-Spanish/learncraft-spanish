import type { JSX } from 'react';
import {
  mockUseLimitedAudioQuizV2,
  overrideMockUseLimitedAudioQuizV2,
  resetMockUseLimitedAudioQuizV2,
} from '@application/useCases/useLimitedAudioQuizV2/useLimitedAudioQuizV2.mock';
import { AudioQuizType } from '@domain/audioQuizzing';
import { LimitedAudioQuizV2 } from '@interface/pages/LimitedAudioQuiz/LimitedAudioQuizV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useLimitedAudioQuizV2', () => ({
  useLimitedAudioQuizV2: mockUseLimitedAudioQuizV2,
}));

vi.mock('@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz', () => ({
  RegularAudioQuiz: () => <div data-testid="audio-quiz" />,
}));

function PathReadout(): JSX.Element {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
}

function renderPage(): void {
  render(
    <MemoryRouter initialEntries={['/customquiz']}>
      <LimitedAudioQuizV2 />
      <PathReadout />
    </MemoryRouter>,
  );
}

describe('limited audio quiz v2', () => {
  afterEach(() => {
    resetMockUseLimitedAudioQuizV2();
    cleanup();
  });

  it('sets up an audio quiz with a lesson range and no flashcard or tag options', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Set up your quiz' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: 'Audio quiz type' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Quiz length')).toBeInTheDocument();
    expect(screen.getByText('412 audio examples found')).toBeInTheDocument();
    expect(
      screen.queryByRole('radiogroup', { name: 'Quiz type' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/tags/i)).not.toBeInTheDocument();
  });

  it('starts the quiz from the CTA', async () => {
    const readyQuiz = vi.fn();
    overrideMockUseLimitedAudioQuizV2({ readyQuiz });

    renderPage();
    await userEvent.click(
      screen.getByRole('button', { name: 'Quiz 20 audio examples' }),
    );

    expect(readyQuiz).toHaveBeenCalledOnce();
  });

  it('switches to a listening quiz', async () => {
    const setAudioQuizType = vi.fn();
    overrideMockUseLimitedAudioQuizV2({ setAudioQuizType });

    renderPage();
    await userEvent.click(screen.getByRole('radio', { name: /Listening/ }));

    expect(setAudioQuizType).toHaveBeenCalledWith(AudioQuizType.Listening);
  });

  it('disables the CTA when nothing can be quizzed', () => {
    overrideMockUseLimitedAudioQuizV2({ quizNotReady: true });

    renderPage();

    expect(
      screen.getByRole('button', { name: 'Quiz 20 audio examples' }),
    ).toBeDisabled();
  });

  it('goes back home from "Back to home"', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Back to home' }));

    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });

  it('shows the quiz once it is ready', () => {
    overrideMockUseLimitedAudioQuizV2({ quizReady: true });

    renderPage();

    expect(screen.getByTestId('audio-quiz')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Set up your quiz' }),
    ).not.toBeInTheDocument();
  });

  it('shows a loader on first load', () => {
    overrideMockUseLimitedAudioQuizV2({ isInitialLoading: true });

    renderPage();

    expect(screen.getByText('Loading audio quiz...')).toBeInTheDocument();
  });

  it('reports an error instead of the setup', () => {
    overrideMockUseLimitedAudioQuizV2({ error: new Error('No examples') });

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('Error: No examples');
    expect(
      screen.queryByRole('heading', { name: 'Set up your quiz' }),
    ).not.toBeInTheDocument();
  });
});
