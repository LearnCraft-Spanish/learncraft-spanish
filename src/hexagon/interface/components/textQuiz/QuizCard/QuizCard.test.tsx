import type { ComponentProps } from 'react';
import { QuizCard } from '@interface/components/textQuiz/QuizCard/QuizCard';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

type QuizCardProps = ComponentProps<typeof QuizCard>;

function renderCard(overrides: Partial<QuizCardProps> = {}): {
  onFlip: ReturnType<typeof vi.fn>;
  onGrade: ReturnType<typeof vi.fn>;
} {
  const onFlip = vi.fn();
  const onGrade = vi.fn();
  render(
    <QuizCard
      srs={false}
      answerShowing
      face={{ text: 'Hola', spanish: false }}
      audioUrl={null}
      showHelpButton={false}
      helpOpen={false}
      onToggleHelp={vi.fn()}
      hintText="Tap to flip"
      onFlip={onFlip}
      onGrade={onGrade}
      {...overrides}
    />,
  );
  return { onFlip, onGrade };
}

function getCard(): HTMLElement {
  return screen.getByRole('button', { name: /Flashcard/ });
}

/**
 * jsdom has no `PointerEvent` constructor, so `fireEvent.pointerDown` et al.
 * fall back to a bare `Event` that drops `clientX`. A `MouseEvent` (which
 * jsdom does support) with the type overridden carries `clientX` the same
 * way a real `PointerEvent` would, since React reads it off the native
 * event by field name rather than by constructor.
 */
function firePointerEvent(
  card: HTMLElement,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  clientX: number,
): void {
  fireEvent(
    card,
    new MouseEvent(type, { clientX, bubbles: true, cancelable: true }),
  );
}

/** Simulates a single pointer-drag gesture from `startX` to `endX`. */
function drag(card: HTMLElement, startX: number, endX: number): void {
  firePointerEvent(card, 'pointerdown', startX);
  firePointerEvent(card, 'pointermove', endX);
  firePointerEvent(card, 'pointerup', endX);
}

describe('quiz card', () => {
  afterEach(() => {
    cleanup();
  });

  it('grades easy after a rightward swipe past 80px', () => {
    const { onGrade } = renderCard({ srs: true, answerShowing: true });

    drag(getCard(), 0, 90);

    expect(onGrade).toHaveBeenCalledOnce();
    expect(onGrade).toHaveBeenCalledWith('easy');
  });

  it('grades hard after a leftward swipe past 80px', () => {
    const { onGrade } = renderCard({ srs: true, answerShowing: true });

    drag(getCard(), 0, -90);

    expect(onGrade).toHaveBeenCalledOnce();
    expect(onGrade).toHaveBeenCalledWith('hard');
  });

  it('does not grade a swipe under the 80px threshold', () => {
    const { onGrade } = renderCard({ srs: true, answerShowing: true });

    drag(getCard(), 0, 40);

    expect(onGrade).not.toHaveBeenCalled();
  });

  it('suppresses the flip after a drag past the 6px tap threshold', () => {
    const { onFlip } = renderCard({ srs: true, answerShowing: true });
    const card = getCard();

    drag(card, 0, 40);
    fireEvent.click(card);

    expect(onFlip).not.toHaveBeenCalled();
  });

  it('still flips on a plain tap with no drag', async () => {
    const user = userEvent.setup();
    const { onFlip } = renderCard({ srs: true, answerShowing: true });

    await user.click(getCard());

    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('never grades or blocks the flip when srs is false, regardless of drag', () => {
    const { onGrade, onFlip } = renderCard({
      srs: false,
      answerShowing: true,
    });
    const card = getCard();

    drag(card, 0, 200);
    fireEvent.click(card);

    expect(onGrade).not.toHaveBeenCalled();
    expect(onFlip).toHaveBeenCalledOnce();
  });

  /* The `helpOpen` root class is what lifts the card's overflow clip on
   * desktop so the word panel can spill past the card's bottom edge
   * (see `QuizCard.module.scss`). */
  it('carries the helpOpen class only while help is open', () => {
    renderCard({ helpOpen: true, helpContent: <div>chips</div> });
    expect(getCard().className).toContain('helpOpen');

    cleanup();
    renderCard({ helpOpen: false });
    expect(getCard().className).not.toContain('helpOpen');
  });
});
