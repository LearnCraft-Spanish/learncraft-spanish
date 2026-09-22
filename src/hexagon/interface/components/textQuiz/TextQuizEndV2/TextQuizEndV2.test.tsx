import { TextQuizEndV2 } from '@interface/components/textQuiz/TextQuizEndV2/TextQuizEndV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseStudentFlashcards = vi.fn();

vi.mock('@application/units/useStudentFlashcards', () => ({
  useStudentFlashcards: () => mockUseStudentFlashcards(),
}));

function renderEnd(props: {
  isSrsQuiz: boolean;
  restartQuiz?: ReturnType<typeof vi.fn>;
  returnToQuizSetup?: ReturnType<typeof vi.fn>;
}): {
  restartQuiz: ReturnType<typeof vi.fn>;
  returnToQuizSetup: ReturnType<typeof vi.fn>;
} {
  const restartQuiz = props.restartQuiz ?? vi.fn();
  const returnToQuizSetup = props.returnToQuizSetup ?? vi.fn();
  render(
    <MemoryRouter>
      <TextQuizEndV2
        isSrsQuiz={props.isSrsQuiz}
        restartQuiz={restartQuiz}
        returnToQuizSetup={returnToQuizSetup}
      />
    </MemoryRouter>,
  );
  return { restartQuiz, returnToQuizSetup };
}

describe('textQuizEndV2 — non-SRS', () => {
  beforeEach(() => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows the quiz-complete heading and restart prompt', () => {
    renderEnd({ isSrsQuiz: false });

    expect(screen.getByText('Text quiz')).toBeTruthy();
    expect(screen.getByText('Quiz Complete!')).toBeTruthy();
    expect(
      screen.getByText(
        /If you would like to retake the quiz, click "Restart Quiz"/,
      ),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restart Quiz' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeTruthy();
  });

  it('calls restartQuiz when "Restart Quiz" is clicked', async () => {
    const { restartQuiz } = renderEnd({ isSrsQuiz: false });

    await userEvent.click(screen.getByRole('button', { name: 'Restart Quiz' }));

    expect(restartQuiz).toHaveBeenCalledOnce();
  });

  it('calls returnToQuizSetup when "Return to Quiz Setup" is clicked', async () => {
    const { returnToQuizSetup } = renderEnd({ isSrsQuiz: false });

    await userEvent.click(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    );

    expect(returnToQuizSetup).toHaveBeenCalledOnce();
  });

  it('does not show the SRS due-for-review card', () => {
    renderEnd({ isSrsQuiz: false });

    expect(screen.queryByText('Still due for review')).toBeNull();
    expect(screen.queryByText('All caught up')).toBeNull();
  });
});

describe('textQuizEndV2 — SRS', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows the SRS-complete heading and hides restart', () => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: [],
    });
    renderEnd({ isSrsQuiz: true });

    expect(screen.getByText('SRS quiz')).toBeTruthy();
    expect(screen.getByText('SRS Quiz Complete!')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Restart Quiz' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    ).toBeTruthy();
  });

  it('shows the due-for-review navy card when flashcards are still due', () => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });
    renderEnd({ isSrsQuiz: true });

    expect(screen.getByText('Still due for review')).toBeTruthy();
    expect(screen.getByText('3 flashcards')).toBeTruthy();
    expect(screen.queryByText('All caught up')).toBeNull();
  });

  it('singularizes the due-count copy for one flashcard', () => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: [{ id: 1 }],
    });
    renderEnd({ isSrsQuiz: true });

    expect(screen.getByText('1 flashcard')).toBeTruthy();
  });

  it('shows the all-caught-up card when no flashcards are due', () => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: [],
    });
    renderEnd({ isSrsQuiz: true });

    expect(screen.getByText('All caught up')).toBeTruthy();
    expect(screen.queryByText('Still due for review')).toBeNull();
  });

  it('treats undefined flashcardsDueForReview as zero due', () => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: undefined,
    });
    renderEnd({ isSrsQuiz: true });

    expect(screen.getByText('All caught up')).toBeTruthy();
    expect(screen.queryByText('Still due for review')).toBeNull();
  });

  it('calls returnToQuizSetup when "Return to Quiz Setup" is clicked', async () => {
    mockUseStudentFlashcards.mockReturnValue({
      flashcardsDueForReview: [],
    });
    const { returnToQuizSetup } = renderEnd({ isSrsQuiz: true });

    await userEvent.click(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    );

    expect(returnToQuizSetup).toHaveBeenCalledOnce();
  });
});
