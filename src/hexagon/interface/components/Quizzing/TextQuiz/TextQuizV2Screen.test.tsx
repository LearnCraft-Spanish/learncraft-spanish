import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  createMockTextQuizReturn,
  createMockTextQuizReturnWithExamples,
} from '@application/units/useTextQuiz/useTextQuiz.mock';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';
import { setQuizActive, useQuizActive } from '@interface/hooks/useQuizChrome';
import { cleanup, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createSrsQuizProps(
  overrides: Partial<UseStudentFlashcardUpdatesReturn> = {},
): UseStudentFlashcardUpdatesReturn {
  return {
    examplesReviewedResults: [],
    handleReviewExample: vi.fn(),
    hasExampleBeenReviewed: () => null,
    flushBatch: vi.fn(async () => Promise.resolve()),
    ...overrides,
  };
}

describe('textQuizV2Screen', () => {
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList(3);

  afterEach(() => {
    cleanup();
    setQuizActive(false);
  });

  it('shows the loading screen while examples load', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturn({
            examplesAreLoading: true,
          })}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('Setting up Quiz...')).toBeInTheDocument();
  });

  it('shows the no-due screen when the quiz has no cards', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturn({ quizLength: 0 })}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('All Caught Up!')).toBeInTheDocument();
  });

  it('shows the complete screen once the quiz is finished', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturn({
            quizLength: 3,
            isQuizComplete: true,
          })}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
  });

  it('shows the SRS complete message when srsQuizProps is present', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturn({
            quizLength: 3,
            isQuizComplete: true,
          })}
          srsQuizProps={createSrsQuizProps()}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('SRS Quiz Complete!')).toBeInTheDocument();
  });

  it('renders the position readout and quiz title for an active card', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturnWithExamples(mockExamples)}
          quizTitle="Lessons 1-5"
        />
      </MockAllProviders>,
    );

    expect(screen.getAllByText('1 / 3').length).toBeGreaterThan(0);
    expect(screen.getByText('Lessons 1-5')).toBeInTheDocument();
  });

  it('shows Previous/Next (no grading) for a non-SRS active card', () => {
    const useTextQuizReturn =
      createMockTextQuizReturnWithExamples(mockExamples);
    // The dock only shows Previous/Next (or Hard/Easy) on the answer side —
    // the prompt side is a fixed-height placeholder instead.
    useTextQuizReturn.answerShowing = true;

    render(
      <MockAllProviders>
        <TextQuizV2Screen useTextQuizReturn={useTextQuizReturn} />
      </MockAllProviders>,
    );

    expect(
      screen.getByRole('button', { name: /Previous/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hard/ })).toBeNull();
  });

  it('advances to the next card via Next', async () => {
    const user = userEvent.setup();
    const useTextQuizReturn =
      createMockTextQuizReturnWithExamples(mockExamples);
    useTextQuizReturn.answerShowing = true;

    render(
      <MockAllProviders>
        <TextQuizV2Screen useTextQuizReturn={useTextQuizReturn} />
      </MockAllProviders>,
    );

    await user.click(screen.getByRole('button', { name: /^Next/ }));

    expect(useTextQuizReturn.nextExample).toHaveBeenCalledOnce();
  });

  it('grades and advances together for an SRS active card', async () => {
    const user = userEvent.setup();
    const useTextQuizReturn = createMockTextQuizReturnWithExamples(
      mockExamples,
      { currentIndex: 0 },
    );
    // Grading only shows on the answer side.
    useTextQuizReturn.answerShowing = true;
    const srsQuizProps = createSrsQuizProps();

    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={useTextQuizReturn}
          srsQuizProps={srsQuizProps}
        />
      </MockAllProviders>,
    );

    await user.click(screen.getByRole('button', { name: /Easy/ }));

    expect(srsQuizProps.handleReviewExample).toHaveBeenCalledWith(
      mockExamples[0].id,
      'easy',
    );
    expect(useTextQuizReturn.nextExample).toHaveBeenCalledOnce();
  });

  it('reflects running tallies from examplesReviewedResults', () => {
    const useTextQuizReturn =
      createMockTextQuizReturnWithExamples(mockExamples);
    const srsQuizProps = createSrsQuizProps({
      examplesReviewedResults: [
        {
          exampleId: 1,
          difficulty: 'hard',
          lastReviewedDate: '2026-01-01',
        },
        {
          exampleId: 2,
          difficulty: 'easy',
          lastReviewedDate: '2026-01-01',
        },
        {
          exampleId: 3,
          difficulty: 'easy',
          lastReviewedDate: '2026-01-01',
        },
      ],
    });

    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={useTextQuizReturn}
          srsQuizProps={srsQuizProps}
        />
      </MockAllProviders>,
    );

    // Rendered twice (mobile progress-header pill + desktop flanking pill);
    // either is proof the tally reached the component.
    expect(
      screen.getAllByRole('status', { name: '1 cards graded hard' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('status', { name: '2 cards graded easy' }).length,
    ).toBeGreaterThan(0);
  });

  it('sets quiz active while an active card is showing', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturnWithExamples(mockExamples)}
        />
      </MockAllProviders>,
    );

    const { result } = renderHook(() => useQuizActive());
    expect(result.current).toBe(true);
  });

  it('does not set quiz active while loading', () => {
    render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturn({
            examplesAreLoading: true,
          })}
        />
      </MockAllProviders>,
    );

    const { result } = renderHook(() => useQuizActive());
    expect(result.current).toBe(false);
  });

  it('clears quiz active when the quiz completes', () => {
    const { rerender } = render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturnWithExamples(mockExamples)}
        />
      </MockAllProviders>,
    );

    const { result } = renderHook(() => useQuizActive());
    expect(result.current).toBe(true);

    rerender(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturn({
            quizLength: 3,
            isQuizComplete: true,
          })}
        />
      </MockAllProviders>,
    );

    expect(result.current).toBe(false);
  });

  it('clears quiz active on unmount', () => {
    const view = render(
      <MockAllProviders>
        <TextQuizV2Screen
          useTextQuizReturn={createMockTextQuizReturnWithExamples(mockExamples)}
        />
      </MockAllProviders>,
    );

    const { result } = renderHook(() => useQuizActive());
    expect(result.current).toBe(true);

    view.unmount();
    expect(result.current).toBe(false);
  });

  it('calls cleanupFunction when the back control is clicked', async () => {
    const user = userEvent.setup();
    const cleanupFunction = vi.fn();
    const useTextQuizReturn =
      createMockTextQuizReturnWithExamples(mockExamples);
    useTextQuizReturn.cleanupFunction = cleanupFunction;

    render(
      <MockAllProviders>
        <TextQuizV2Screen useTextQuizReturn={useTextQuizReturn} />
      </MockAllProviders>,
    );

    await user.click(
      screen.getAllByRole('button', { name: 'Back to quiz setup' })[0],
    );

    expect(cleanupFunction).toHaveBeenCalledOnce();
  });

  it('passes addPendingRemoveProps through to the favourite control', async () => {
    const user = userEvent.setup();
    const addFlashcard = vi.fn();
    const useTextQuizReturn =
      createMockTextQuizReturnWithExamples(mockExamples);
    useTextQuizReturn.addPendingRemoveProps = {
      isAdding: false,
      isRemoving: false,
      isCollected: false,
      isCustom: false,
      addFlashcard,
      removeFlashcard: vi.fn(),
    };

    render(
      <MockAllProviders>
        <TextQuizV2Screen useTextQuizReturn={useTextQuizReturn} />
      </MockAllProviders>,
    );

    await user.click(
      screen.getByRole('button', { name: /Add to my flashcards/ }),
    );

    expect(addFlashcard).toHaveBeenCalledOnce();
  });
});
