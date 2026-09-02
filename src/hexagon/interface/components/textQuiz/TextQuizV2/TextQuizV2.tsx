import type { SrsDifficulty } from '@domain/srs';
import type { TextQuizV2Props } from '@interface/components/textQuiz/TextQuizV2/TextQuizV2.types';
import type { JSX } from 'react';
import { KeyboardHints } from '@interface/components/textQuiz/KeyboardHints';
import { QuizCard } from '@interface/components/textQuiz/QuizCard';
import { QuizDock } from '@interface/components/textQuiz/QuizDock';
import { QuizProgressHeader } from '@interface/components/textQuiz/QuizProgressHeader';
import { TallyPill } from '@interface/components/textQuiz/TallyPill';
import { WordChips } from '@interface/components/textQuiz/WordChips';
import { WordPanel } from '@interface/components/textQuiz/WordPanel';
import { useEffect, useState } from 'react';
import styles from './TextQuizV2.module.scss';

const INTERACTIVE_TAGS = new Set([
  'BUTTON',
  'A',
  'INPUT',
  'TEXTAREA',
  'SELECT',
]);

/** True while focus sits on a control that already owns its own key handling. */
function isFocusOnInteractiveElement(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) {
    return false;
  }
  return (
    INTERACTIVE_TAGS.has(active.tagName) ||
    active.getAttribute('role') === 'button'
  );
}

/**
 * The v2 text quiz screen. Composes the progress header, the card, the dock,
 * and the desktop keyboard legend. `srs` reaches `QuizDock`, `TallyPill`,
 * and `QuizCard` — the card only uses it to gate swipe-to-grade.
 *
 * Owns which vocabulary chip is selected: that is local visual state, not
 * business state, so it lives here rather than in the application layer.
 */
export function TextQuizV2({
  srs,
  quizTitle,
  exampleNumber,
  quizLength,
  quizExample,
  answerShowing,
  toggleAnswer,
  getHelpIsOpen,
  setGetHelpIsOpen,
  vocabInfoHook,
  addPendingRemoveProps,
  onPrevious,
  onNext,
  onGrade,
  tallies,
}: TextQuizV2Props): JSX.Element {
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

  // A new card can never carry over the previous one's chip selection, even
  // if the caller navigates by some path other than `onPrevious`/`onNext`.
  useEffect(() => {
    setSelectedWordId(null);
  }, [exampleNumber]);

  function closeHelpAndClearWord(): void {
    setGetHelpIsOpen(false);
    setSelectedWordId(null);
  }

  function handleFlip(): void {
    closeHelpAndClearWord();
    toggleAnswer();
  }

  function handleToggleHelp(): void {
    if (getHelpIsOpen) {
      closeHelpAndClearWord();
    } else {
      setGetHelpIsOpen(true);
    }
  }

  function handleSelectWord(id: number): void {
    setSelectedWordId((current) => (current === id ? null : id));
  }

  function handlePrevious(): void {
    closeHelpAndClearWord();
    onPrevious();
  }

  function handleNext(): void {
    closeHelpAndClearWord();
    onNext();
  }

  function handleGrade(difficulty: SrsDifficulty): void {
    closeHelpAndClearWord();
    onGrade?.(difficulty);
  }

  // The keyboard legend in `KeyboardHints` advertises these shortcuts, so
  // they are wired globally rather than only while the card has focus. Any
  // control that already owns Space/Enter (the card itself, a chip, Get
  // help, Previous/Next) is left alone so it is not double-handled.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (isFocusOnInteractiveElement()) {
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        handleFlip();
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (srs) {
          handleGrade('hard');
        } else {
          handlePrevious();
        }
        return;
      }
      if (event.key === 'ArrowRight') {
        if (srs) {
          handleGrade('easy');
        } else {
          handleNext();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [srs, handleFlip, handleGrade, handlePrevious, handleNext]);

  if (!quizExample) {
    return (
      <div className={styles.root}>
        <QuizProgressHeader
          quizTitle={quizTitle}
          exampleNumber={exampleNumber}
          quizLength={quizLength}
          srs={srs}
          tallies={tallies}
        />
        <p className={styles.empty}>No card to show.</p>
      </div>
    );
  }

  const { question, answer } = quizExample;
  const face = answerShowing
    ? { text: answer.text, spanish: answer.spanish }
    : { text: question.text, spanish: question.spanish };
  const audioUrl = answerShowing
    ? answer.hasAudio
      ? answer.audioUrl
      : question.hasAudio
        ? question.audioUrl
        : null
    : question.hasAudio
      ? question.audioUrl
      : null;
  const showHelpButton = answerShowing && answer.vocabComplete;

  const hintText = getHelpIsOpen
    ? 'Tap a word for its lesson'
    : !answerShowing
      ? 'Tap to flip'
      : srs
        ? 'Swipe to grade · left hard, right easy'
        : 'Tap the card to see the prompt again';

  const selectedVocab =
    selectedWordId !== null
      ? (answer.vocabulary.find((vocab) => vocab.id === selectedWordId) ?? null)
      : null;

  const favourite = addPendingRemoveProps
    ? {
        isFavourited: addPendingRemoveProps.isCollected,
        isPending:
          addPendingRemoveProps.isAdding || addPendingRemoveProps.isRemoving,
        onToggle: () =>
          addPendingRemoveProps.isCollected
            ? addPendingRemoveProps.removeFlashcard()
            : addPendingRemoveProps.addFlashcard(),
      }
    : undefined;

  const helpContent = getHelpIsOpen ? (
    <WordChips
      vocabulary={answer.vocabulary}
      selectedId={selectedWordId}
      onSelect={handleSelectWord}
      panel={
        selectedVocab ? (
          <WordPanel
            key={selectedVocab.id}
            vocabulary={selectedVocab}
            vocabInfoHook={vocabInfoHook}
          />
        ) : undefined
      }
    />
  ) : undefined;

  return (
    <div className={styles.root}>
      <QuizProgressHeader
        quizTitle={quizTitle}
        exampleNumber={exampleNumber}
        quizLength={quizLength}
        srs={srs}
        tallies={tallies}
      />

      <div className={styles.cardRow}>
        {srs && tallies && (
          <TallyPill
            side="left"
            tone="error"
            icon="x"
            count={tallies.hard}
            label={`${tallies.hard} cards graded hard`}
          />
        )}

        <QuizCard
          srs={srs}
          answerShowing={answerShowing}
          face={face}
          audioUrl={audioUrl}
          favourite={favourite}
          showHelpButton={showHelpButton}
          helpOpen={getHelpIsOpen}
          onToggleHelp={handleToggleHelp}
          hintText={hintText}
          onFlip={handleFlip}
          helpContent={helpContent}
          onGrade={handleGrade}
        />

        {srs && tallies && (
          <TallyPill
            side="right"
            tone="success"
            icon="check"
            count={tallies.easy}
            label={`${tallies.easy} cards graded easy`}
          />
        )}
      </div>

      <QuizDock
        srs={srs}
        answerShowing={answerShowing}
        isFirst={exampleNumber <= 1}
        isLast={exampleNumber >= quizLength}
        onGrade={handleGrade}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <KeyboardHints srs={srs} />
    </div>
  );
}
