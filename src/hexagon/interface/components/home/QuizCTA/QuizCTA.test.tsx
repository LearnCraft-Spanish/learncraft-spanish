import { QuizCTA } from '@interface/components/home/QuizCTA/QuizCTA';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function renderCta(onGo = vi.fn()) {
  return render(
    <QuizCTA
      headline="Quiz my flashcards"
      eyebrow="Today's suggested tool"
      onGo={onGo}
    />,
  );
}

describe('quiz cta', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the suggested-tool eyebrow and headline, with no metadata line', () => {
    renderCta();

    expect(screen.getByText("Today's suggested tool")).toBeInTheDocument();
    expect(screen.getByText('Quiz my flashcards')).toBeInTheDocument();
    expect(screen.queryByText(/due/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/minute/i)).not.toBeInTheDocument();
  });

  it('is a single button-shaped target: the whole card is the action', () => {
    renderCta();

    expect(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    ).toBeInTheDocument();
  });

  it('renders the headline and eyebrow passed as props', () => {
    render(
      <QuizCTA
        headline="Official Quiz"
        eyebrow="Today's suggested tool"
        onGo={vi.fn()}
      />,
    );

    expect(screen.getByText('Official Quiz')).toBeInTheDocument();
    expect(screen.getByText("Today's suggested tool")).toBeInTheDocument();
  });

  it('calls onGo when clicked', async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    renderCta(onGo);

    await user.click(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    );

    expect(onGo).toHaveBeenCalledOnce();
  });

  it('calls onGo on Enter, being a real button', async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    renderCta(onGo);

    screen.getByRole('button', { name: /Quiz my flashcards/ }).focus();
    await user.keyboard('{Enter}');

    expect(onGo).toHaveBeenCalledOnce();
  });
});
