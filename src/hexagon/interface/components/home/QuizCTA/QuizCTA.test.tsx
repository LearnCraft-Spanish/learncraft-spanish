import { QuizCTA } from '@interface/components/home/QuizCTA/QuizCTA';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('quiz cta', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the headline as the only text, with no metadata line', () => {
    render(<QuizCTA onGo={vi.fn()} />);

    expect(screen.getByText('Quiz my flashcards')).toBeInTheDocument();
    expect(screen.queryByText(/due/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/minute/i)).not.toBeInTheDocument();
  });

  it('is a single button-shaped target: the whole card is the action', () => {
    render(<QuizCTA onGo={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    ).toBeInTheDocument();
  });

  it('calls onGo when clicked', async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    render(<QuizCTA onGo={onGo} />);

    await user.click(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    );

    expect(onGo).toHaveBeenCalledOnce();
  });

  it('calls onGo on Enter, being a real button', async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    render(<QuizCTA onGo={onGo} />);

    screen.getByRole('button', { name: /Quiz my flashcards/ }).focus();
    await user.keyboard('{Enter}');

    expect(onGo).toHaveBeenCalledOnce();
  });
});
