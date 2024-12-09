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
    render(<AudioBasedReview willAutoplay={false} />, {
      wrapper: MockAllProviders,
    });
    expect(screen.getByText('Loading Audio...')).toBeInTheDocument();
  });
  it('await data load, component renders', async () => {
    render(<AudioBasedReview willAutoplay={false} />, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => expect(screen.getByText('From:')).toBeInTheDocument());
    expect(screen.getByText('Comprehension Quiz')).toBeInTheDocument();
    expect(screen.queryByText('Loading Audio...')).not.toBeInTheDocument();
  });
});

describe('begin a quiz', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  it('clicking begin quiz, shows quiz', async () => {
    render(<AudioBasedReview willAutoplay={false} />, {
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

async function startQuiz() {
  render(<AudioBasedReview willAutoplay={false} />, {
    wrapper: MockAllProviders,
  });
  await waitFor(() => {
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
describe('navigating steps in flashcard', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  it('incrementCurrentStep, shows next step', async () => {
    await startQuiz();
    act(() => {
      fireEvent.click(screen.getByText('Show Spanish'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Show Spanish')).not.toBeInTheDocument();
    });
    // expect flashcard number to still be 1
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });
});
