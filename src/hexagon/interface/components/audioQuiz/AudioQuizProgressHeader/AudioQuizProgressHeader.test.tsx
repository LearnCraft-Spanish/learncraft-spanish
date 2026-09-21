import { AudioQuizProgressHeader } from '@interface/components/audioQuiz/AudioQuizProgressHeader/AudioQuizProgressHeader';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('audioQuizProgressHeader', () => {
  it('shows the category, the form, and the position', () => {
    render(
      <AudioQuizProgressHeader
        eyebrow="Custom Quiz"
        subtitle="Speaking Quiz"
        exampleNumber={1}
        quizLength={3}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('Custom Quiz')).toBeInTheDocument();
    expect(screen.getByText('Speaking Quiz')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('leaves the quiz when back is pressed', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(
      <AudioQuizProgressHeader
        eyebrow="My Flashcards Quiz"
        subtitle="Listening Quiz"
        exampleNumber={4}
        quizLength={4}
        onExit={onExit}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Back to quiz setup' }),
    );

    expect(onExit).toHaveBeenCalledOnce();
  });
});
