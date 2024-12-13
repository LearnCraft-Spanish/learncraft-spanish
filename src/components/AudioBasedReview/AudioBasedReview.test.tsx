import { act } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { setupMockAuth } from '../../../tests/setupMockAuth';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';

import AudioBasedReview from './AudioBasedReview';

function renderAudioBasedReview(props = {}) {
  render(
    <AudioBasedReview willAutoplay={false} quizTitle="Test Quiz" {...props} />,
    {
      wrapper: MockAllProviders,
    },
  );
}

async function selectLessons() {
  const courseSelector = (await screen.findByLabelText(
    'Course:',
  )) as HTMLSelectElement;
  fireEvent.change(courseSelector, { target: { value: '2' } });
  await waitFor(() => {
    expect(courseSelector.value).toBe('2');
  });

  const toLessonSelector = (await screen.findByLabelText(
    'To:',
  )) as HTMLSelectElement;
  fireEvent.change(toLessonSelector, { target: { value: '131' } });
  await waitFor(() => {
    expect(toLessonSelector.value).toBe('131');
  });

  await waitFor(() => {
    expect(
      screen.queryByText('There are no audio examples for this lesson range'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
}

describe('audioBasedReview Component', () => {
  beforeEach(() => {
    setupMockAuth();
  });

  describe('initial State', () => {
    it('displays loading message while waiting for data', async () => {
      renderAudioBasedReview();
      expect(screen.getByText('Loading Audio...')).toBeInTheDocument();
    });

    it('renders quiz title and hides loading message after data loads', async () => {
      renderAudioBasedReview();
      await waitFor(() =>
        expect(screen.getByText('From:')).toBeInTheDocument(),
      );
      expect(screen.getByText('Comprehension Quiz')).toBeInTheDocument();
      expect(screen.queryByText('Loading Audio...')).not.toBeInTheDocument();
    });
  });

  describe('lesson Selection', () => {
    it('allows the user to select a course and lessons', async () => {
      renderAudioBasedReview();
      await selectLessons();
    });
  });

  describe('quiz Interaction', () => {
    it('starts the quiz and displays navigation buttons', async () => {
      renderAudioBasedReview();
      await selectLessons();
      fireEvent.click(screen.getByText('Start'));

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
        expect(screen.getByText('Previous')).toBeInTheDocument();
      });
    });
  });

  describe('autoplay Behavior', () => {
    beforeEach(() => {
      setupMockAuth({ userName: 'student-admin' });
    });

    it('works in an audio quiz with autoplay enabled', async () => {
      renderAudioBasedReview({
        audioOrComprehension: 'audio',
        willAutoplay: true,
      });
      await selectLessons();
      fireEvent.click(screen.getByText('Start'));

      await waitFor(() => {
        expect(screen.queryByText('Skip to Guess')).toBeInTheDocument();
      });
      act(() => fireEvent.click(screen.getByText('Skip to Guess')));

      await waitFor(() => {
        expect(screen.queryByText('Skip to Guess')).not.toBeInTheDocument();
        expect(screen.queryByText('Play Spanish')).toBeInTheDocument();
      });
    });

    it('works in a comprehension quiz with autoplay disabled', async () => {
      renderAudioBasedReview({
        audioOrComprehension: 'comprehension',
        willAutoplay: false,
      });
      await selectLessons();
      fireEvent.click(screen.getByText('Start'));

      await waitFor(() => {
        expect(screen.queryByText('Show Spanish')).toBeInTheDocument();
      });
      act(() => fireEvent.click(screen.getByText('Show Spanish')));

      await waitFor(() => {
        expect(screen.queryByText('Show Spanish')).not.toBeInTheDocument();
        expect(screen.queryByText('Show English')).toBeInTheDocument();
      });
    });
  });

  describe('navigation Buttons', () => {
    it('navigates to the next question in an audio quiz', async () => {
      renderAudioBasedReview({
        audioOrComprehension: 'audio',
        willAutoplay: false,
      });
      await selectLessons();
      fireEvent.click(screen.getByText('Start'));

      const nextButton = await screen.findByText('Next');
      act(() => fireEvent.click(nextButton));

      await waitFor(() => {
        expect(screen.getByText(/2/)).toBeInTheDocument();
        expect(screen.queryByText('Play Spanish')).toBeInTheDocument();
      });
    });

    it('handles navigation in a comprehension quiz', async () => {
      renderAudioBasedReview({
        audioOrComprehension: 'comprehension',
        willAutoplay: false,
      });
      await selectLessons();
      fireEvent.click(screen.getByText('Start'));

      const nextButton = await screen.findByText('Next');
      act(() => fireEvent.click(nextButton));

      await waitFor(() => {
        expect(screen.getByText(/2/)).toBeInTheDocument();
        expect(screen.queryByText('Show Spanish')).toBeInTheDocument();
      });
    });
  });
});
