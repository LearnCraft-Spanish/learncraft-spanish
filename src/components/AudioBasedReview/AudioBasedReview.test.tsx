import { act } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { setupMockAuth } from '../../../tests/setupMockAuth';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';

import AudioBasedReview from './AudioBasedReview';

describe('initial state', () => {
  beforeEach(() => {
    setupMockAuth();
  });
  it('while waiting for data, shows loading', async () => {
    render(<AudioBasedReview willAutoplay={false} quizTitle={'Test Quiz'} />, {
      wrapper: MockAllProviders,
    });
    expect(screen.getByText('Loading Audio...')).toBeInTheDocument();
  });
  it('await data load, component renders', async () => {
    render(<AudioBasedReview willAutoplay={false} quizTitle={'Test Quiz'} />, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => expect(screen.getByText('From:')).toBeInTheDocument());
    expect(screen.getByText('Comprehension Quiz')).toBeInTheDocument();
    expect(screen.queryByText('Loading Audio...')).not.toBeInTheDocument();
  });
});

describe('menu options work', () => {
  it('clicking on audio, shows audio quiz', async () => {
    render(<AudioBasedReview willAutoplay={false} quizTitle={'Test Quiz'} />, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Audio Quiz'));
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });
});

describe('begin a quiz', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  it('clicking begin quiz, shows quiz', async () => {
    render(<AudioBasedReview willAutoplay={false} quizTitle={'Test Quiz'} />, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start'));
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });
  });
});

async function startAudioQuiz(
  audioOrComprehension: 'audio' | 'comprehension' = 'audio',
  willAutoplay: boolean = false,
) {
  render(
    <AudioBasedReview
      audioOrComprehension={audioOrComprehension}
      willAutoplay={willAutoplay}
      quizTitle={'Test Quiz'}
    />,
    {
      wrapper: MockAllProviders,
    },
  );
  let courseSelector: HTMLSelectElement;
  let toLessonSelector: HTMLSelectElement;
  await waitFor(() => {
    courseSelector = screen.getByText('LearnCraft Spanish');
    expect(courseSelector).toBeInTheDocument();
  });
  act(() => {
    fireEvent.change(courseSelector, { target: { value: '2' } });
  });

  await waitFor(() => {
    const lessonSelectors = screen.getAllByText('Lesson 1');
    expect(lessonSelectors).toHaveLength(2);
    toLessonSelector = lessonSelectors[1] as HTMLSelectElement;
    expect(toLessonSelector).toBeInTheDocument();
    expect(
      screen.getByText('There are no audio examples for this lesson range'),
    ).toBeInTheDocument();
  });
  act(() => {
    fireEvent.change(toLessonSelector, { target: { value: '150' } });
  });
  await waitFor(() => {
    expect(screen.getByText('Lesson 150')).toBeInTheDocument();
    expect(
      screen.queryByText('There are no audio examples for this lesson range'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
  act(() => {
    fireEvent.click(screen.getByText('Start'));
  });
  await waitFor(() => {
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });
}

describe('all steps work', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'limited' });
  });
  it('in audio quiz on autoplay', async () => {
    await startAudioQuiz('audio', true);
    await waitFor(() => {
      expect(screen.queryByText('Skip to Guess')).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Skip to Guess'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Skip to Guess')).not.toBeInTheDocument();
      expect(screen.queryByText('Play Spanish')).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Play Spanish'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Play Spanish')).not.toBeInTheDocument();
      expect(screen.queryByText('Play Again')).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Play Again'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Play Again')).not.toBeInTheDocument();
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      const firstNext = nextsArray[0];
      fireEvent.click(firstNext);
    });
    await waitFor(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(1);
      expect(screen.queryByText('Skip to Guess')).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });
  it('in comprehension quiz on autoplay', async () => {
    await startAudioQuiz('comprehension', true);
    await waitFor(() => {
      expect(screen.queryByText('Skip to Guess')).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Skip to Guess'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Skip to Guess')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Spanish')).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Show Spanish'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Show Spanish')).not.toBeInTheDocument();
      expect(screen.queryByText('Show English')).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Show English'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Show English')).not.toBeInTheDocument();
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      const firstNext = nextsArray[0];
      fireEvent.click(firstNext);
    });
    await waitFor(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(1);
      expect(screen.queryByText('Skip to Guess')).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });
  it('in audio quiz without autoplay', async () => {
    await startAudioQuiz('audio', false);
    await waitFor(() => {
      expect(screen.queryByText('Play Spanish')).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Play Spanish'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Play Spanish')).not.toBeInTheDocument();
      expect(screen.queryByText('Play Again')).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Play Again'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Play Again')).not.toBeInTheDocument();
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      const firstNext = nextsArray[0];
      fireEvent.click(firstNext);
    });
    await waitFor(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(1);
      expect(screen.queryByText('Play Spanish')).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });
  it('in comprehension quiz without autoplay', async () => {
    await startAudioQuiz('comprehension', false);
    await waitFor(() => {
      expect(screen.queryByText('Show Spanish')).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Show Spanish'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Show Spanish')).not.toBeInTheDocument();
      expect(screen.queryByText('Show English')).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getByText('Show English'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Show English')).not.toBeInTheDocument();
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
    act(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(2);
      const firstNext = nextsArray[0];
      fireEvent.click(firstNext);
    });
    await waitFor(() => {
      const nextsArray = screen.getAllByText('Next');
      expect(nextsArray).toHaveLength(1);
      expect(screen.queryByText('Show Spanish')).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });
});
