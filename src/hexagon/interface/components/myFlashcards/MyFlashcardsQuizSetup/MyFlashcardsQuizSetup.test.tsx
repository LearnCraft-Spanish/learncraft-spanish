import type { UseQuizMyFlashcardsReturn } from '@application/useCases/useQuizMyFlashcards';
import { MyFlashcardsQuizType } from '@application/useCases/useQuizMyFlashcards';
import { defaultMockUseQuizMyFlashcards } from '@application/useCases/useQuizMyFlashcards/useQuizMyFlashcards.mock';
import { MyFlashcardsQuizSetup } from '@interface/components/myFlashcards/MyFlashcardsQuizSetup/MyFlashcardsQuizSetup';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@interface/components/studentFlashcards/FilterSection', () => ({
  FilterSection: ({
    onResetAll,
  }: {
    exampleFilter: unknown;
    onResetAll?: () => void;
  }) => (
    <div data-testid="filter-section">
      <button type="button" onClick={onResetAll}>
        mock-reset
      </button>
    </div>
  ),
}));

function renderSetup(
  overrides: Partial<UseQuizMyFlashcardsReturn> = {},
  onLeave = vi.fn(),
) {
  const quiz = { ...defaultMockUseQuizMyFlashcards, ...overrides };
  render(<MyFlashcardsQuizSetup quiz={quiz} onLeave={onLeave} />);
  return { quiz, onLeave };
}

describe('myFlashcardsQuizSetup', () => {
  it('shows the quiz type options and the match count', () => {
    renderSetup();

    expect(screen.getByRole('radio', { name: 'Flashcards' })).toBeChecked();
    expect(screen.getAllByText('42 flashcards found').length).toBeGreaterThan(
      0,
    );
  });

  it('the CTA offers what will be drilled, not the total', () => {
    renderSetup();

    expect(
      screen.getByRole('button', { name: 'Quiz 20 flashcards' }),
    ).toBeInTheDocument();
  });

  it('leaves the page from the back affordance', async () => {
    const onLeave = vi.fn();
    renderSetup({}, onLeave);

    await userEvent.click(
      screen.getByRole('button', { name: /back to home/i }),
    );

    expect(onLeave).toHaveBeenCalled();
  });

  it('choosing audio calls back with the audio quiz type', async () => {
    const setQuizType = vi.fn();
    renderSetup({ setQuizType });

    await userEvent.click(screen.getByRole('radio', { name: 'Audio' }));

    expect(setQuizType).toHaveBeenCalledWith(MyFlashcardsQuizType.Audio);
  });

  it('swaps the flashcard options for the audio ones', () => {
    renderSetup({ quizType: MyFlashcardsQuizType.Audio, isAudioQuiz: true });

    expect(screen.queryByText('SRS quiz')).toBeNull();
    expect(screen.queryByText('Start with Spanish')).toBeNull();

    expect(screen.getByRole('radio', { name: 'Speaking' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Listening' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Autoplay')).toBeChecked();
  });

  it('the filter control reads as its own header, matching Flashcard Manager', () => {
    renderSetup();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Filter my flashcards' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Filter my flashcards' }),
    ).toBeInTheDocument();
  });

  it('turns advanced filtering on through the filter control toggle', async () => {
    const setFilterOwnedFlashcards = vi.fn();
    renderSetup({ setFilterOwnedFlashcards });

    await userEvent.click(
      screen.getByRole('switch', { name: 'Filter my flashcards' }),
    );

    expect(setFilterOwnedFlashcards).toHaveBeenCalledWith(true);
  });

  it('keeps the filter section closed until the toggle is on', () => {
    renderSetup({ filterOwnedFlashcards: false });

    expect(screen.queryByTestId('filter-section')).toBeNull();
  });

  it('shows the filter section once the toggle is on', () => {
    renderSetup({ filterOwnedFlashcards: true });

    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
  });

  it('shows a badge with the applied filter count', () => {
    renderSetup({
      exampleFilter: {
        ...defaultMockUseQuizMyFlashcards.exampleFilter,
        excludeSpanglish: true,
        audioOnly: true,
      },
    });

    expect(screen.getByText('2 filters applied')).toBeInTheDocument();
  });

  it('resets filters from the filter section', async () => {
    const resetFilters = vi.fn();
    renderSetup({ filterOwnedFlashcards: true, resetFilters });

    await userEvent.click(screen.getByRole('button', { name: 'mock-reset' }));

    expect(resetFilters).toHaveBeenCalled();
  });

  it('places the filter control and its revealed section above the quiz options', () => {
    renderSetup({ filterOwnedFlashcards: true });

    const filterToggle = screen.getByRole('switch', {
      name: 'Filter my flashcards',
    });
    const filterSection = screen.getByTestId('filter-section');
    const quizTypeRadiogroup = screen.getByRole('radiogroup', {
      name: 'Quiz type',
    });

    // DOCUMENT_POSITION_FOLLOWING means the compared node comes after.
    expect(
      filterToggle.compareDocumentPosition(filterSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      filterSection.compareDocumentPosition(quizTypeRadiogroup) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
