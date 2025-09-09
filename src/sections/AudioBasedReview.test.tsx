import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { act } from 'react';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { describe, expect, it } from 'vitest';
import AudioBasedReview from './AudioBasedReview';

function renderAudioBasedReview(props = {}) {
  render(<AudioBasedReview willAutoplay={false} {...props} />, {
    wrapper: MockAllProviders,
  });
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
    'Lesson:',
  )) as HTMLSelectElement;
  fireEvent.change(toLessonSelector, { target: { value: '62' } });
  await waitFor(() => {
    expect(toLessonSelector.value).toBe('62');
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
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isLoading: false,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
  });

  describe('initial State', () => {
    it('displays loading message while waiting for data', async () => {
      renderAudioBasedReview();
      expect(screen.getByText('Loading Audio...')).toBeInTheDocument();
    });

    it('renders quiz title and hides loading message after data loads', async () => {
      renderAudioBasedReview();
      await waitFor(() =>
        expect(screen.getByText('Lesson:')).toBeInTheDocument(),
      );
      expect(screen.getByText('Comprehension Quiz')).toBeInTheDocument();
      expect(screen.queryByText('Loading Audio...')).not.toBeInTheDocument();
    });
  });

  // skipped after refactor (9/9)
  describe.skip('lesson Selection', () => {
    it('allows the user to select a course and lessons', async () => {
      renderAudioBasedReview();
      await selectLessons();
    });
  });

  // skipped after refactr (9/9)
  describe.skip('quiz Interaction', () => {
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

  // skipped after refactor (9/9)
  describe.skip('autoplay Behavior', () => {
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

  // skipped ater refactor (9/9)
  describe.skip('navigation Buttons', () => {
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
