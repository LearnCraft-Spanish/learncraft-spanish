import type { ComponentProps } from 'react';
import { QuizDock } from '@interface/components/textQuiz/QuizDock/QuizDock';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

type QuizDockProps = ComponentProps<typeof QuizDock>;

function renderDock(overrides: Partial<QuizDockProps> = {}): {
  onGrade: ReturnType<typeof vi.fn>;
  onPrevious: ReturnType<typeof vi.fn>;
  onNext: ReturnType<typeof vi.fn>;
} {
  const onGrade = vi.fn();
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  render(
    <QuizDock
      srs={false}
      answerShowing
      isFirst={false}
      isLast={false}
      onGrade={onGrade}
      onPrevious={onPrevious}
      onNext={onNext}
      {...overrides}
    />,
  );
  return { onGrade, onPrevious, onNext };
}

function expectBefore(earlier: HTMLElement, later: HTMLElement): void {
  expect(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
}

describe('quiz dock', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows Previous and Next on the question side of a non-SRS quiz', () => {
    renderDock({ srs: false, answerShowing: false });

    expect(
      screen.getByRole('button', { name: /Previous/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next/ })).toBeInTheDocument();
    expect(
      screen.queryByText('Flip the card to see the answer'),
    ).not.toBeInTheDocument();
  });

  it('keeps the SRS placeholder above Previous and Next on the question side', () => {
    renderDock({ srs: true, answerShowing: false });

    const placeholder = screen.getByText('Flip the card to see the answer');
    const previous = screen.getByRole('button', { name: /Previous/ });
    const next = screen.getByRole('button', { name: /^Next/ });

    expectBefore(placeholder, previous);
    expectBefore(placeholder, next);
    expect(
      screen.queryByRole('button', { name: /Hard/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Easy/ }),
    ).not.toBeInTheDocument();
  });

  it('puts Hard and Easy above Previous and Next on the SRS answer side', () => {
    renderDock({ srs: true, answerShowing: true });

    const hard = screen.getByRole('button', { name: /Hard/ });
    const easy = screen.getByRole('button', { name: /Easy/ });
    const previous = screen.getByRole('button', { name: /Previous/ });

    expectBefore(hard, previous);
    expectBefore(easy, previous);
    expect(
      screen.queryByText('Flip the card to see the answer'),
    ).not.toBeInTheDocument();
  });

  it('labels the non-SRS Next button as Next on any card but the last', () => {
    renderDock({ srs: false, isLast: false });

    expect(screen.getByRole('button', { name: /^Next/ })).toBeInTheDocument();
  });

  it('labels the non-SRS Next button as Finish on the last card', () => {
    renderDock({ srs: false, isLast: true });

    expect(screen.getByRole('button', { name: /^Finish/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Next/ }),
    ).not.toBeInTheDocument();
  });

  it('calls onNext when Finish is clicked, same as Next', async () => {
    const user = userEvent.setup();
    const { onNext } = renderDock({ srs: false, isLast: true });

    await user.click(screen.getByRole('button', { name: /^Finish/ }));

    expect(onNext).toHaveBeenCalledOnce();
  });

  it('disables Previous on the first card', () => {
    renderDock({ srs: false, isFirst: true });

    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled();
  });

  it('ignores isLast for the SRS dock and shows Hard/Easy plus Next', () => {
    renderDock({ srs: true, isLast: true });

    expect(screen.getByRole('button', { name: /Hard/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Easy/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Finish/ }),
    ).not.toBeInTheDocument();
  });

  it('grades hard and easy via the SRS buttons', async () => {
    const user = userEvent.setup();
    const { onGrade } = renderDock({ srs: true });

    await user.click(screen.getByRole('button', { name: /Hard/ }));
    await user.click(screen.getByRole('button', { name: /Easy/ }));

    expect(onGrade).toHaveBeenNthCalledWith(1, 'hard');
    expect(onGrade).toHaveBeenNthCalledWith(2, 'easy');
  });
});
