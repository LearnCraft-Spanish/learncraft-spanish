import { QuizProgressHeader } from '@interface/components/textQuiz/QuizProgressHeader/QuizProgressHeader';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('quizProgressHeader', () => {
  it('shows the position and leaves the quiz when back is pressed', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(
      <QuizProgressHeader
        eyebrow="Custom Quiz"
        subtitle="Text Quiz"
        exampleNumber={2}
        quizLength={10}
        srs={false}
        onExit={onExit}
      />,
    );

    expect(screen.getAllByText('2 / 10').length).toBeGreaterThan(0);
    expect(screen.getByText('Text Quiz')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Back to quiz setup' }),
    );

    expect(onExit).toHaveBeenCalledOnce();
  });

  it('shows hard and easy tallies only for an SRS quiz', () => {
    const { rerender } = render(
      <QuizProgressHeader
        exampleNumber={1}
        quizLength={4}
        srs={false}
        tallies={{ hard: 2, easy: 1 }}
        onExit={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('status', { name: '2 cards graded hard' }),
    ).toBeNull();

    rerender(
      <QuizProgressHeader
        exampleNumber={1}
        quizLength={4}
        srs
        tallies={{ hard: 2, easy: 1 }}
        onExit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('status', { name: '2 cards graded hard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: '1 cards graded easy' }),
    ).toBeInTheDocument();
  });

  it('draws an empty track when the quiz has no cards', () => {
    const { container } = render(
      <QuizProgressHeader
        exampleNumber={0}
        quizLength={0}
        srs={false}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getAllByText('0 / 0').length).toBeGreaterThan(0);
    expect(container.querySelector('[style]')).toHaveStyle({ width: '0%' });
  });
});
