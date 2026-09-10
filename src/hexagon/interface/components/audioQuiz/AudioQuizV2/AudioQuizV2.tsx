import type { AudioQuizV2Props } from '@interface/components/audioQuiz/AudioQuizV2/AudioQuizV2.types';
import type { JSX } from 'react';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { audioQuizCopy } from '@domain/functions/audioQuizCopy';
import { orderVocabularyByAppearance } from '@domain/functions/orderVocabularyByAppearance';
import { audioQuizTitle } from '@domain/functions/quizTitle';
import { AudioQuizCard } from '@interface/components/audioQuiz/AudioQuizCard';
import { AudioQuizDock } from '@interface/components/audioQuiz/AudioQuizDock';
import { AudioQuizProgressHeader } from '@interface/components/audioQuiz/AudioQuizProgressHeader';
import { WordChips } from '@interface/components/textQuiz/WordChips';
import { WordPanel } from '@interface/components/textQuiz/WordPanel';
import { WordPanelModal } from '@interface/components/textQuiz/WordPanelModal';
import { useMediaQuery } from '@interface/hooks/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import styles from './AudioQuizV2.module.scss';

const INTERACTIVE_TAGS = new Set([
  'BUTTON',
  'A',
  'INPUT',
  'TEXTAREA',
  'SELECT',
]);

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

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

/** True while focus sits in a field where arrow keys move the caret. */
function isFocusOnTextEntry(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) {
    return false;
  }
  return TEXT_ENTRY_TAGS.has(active.tagName) || active.isContentEditable;
}

/**
 * The v2 audio quiz screen. Composes the progress header, the card, and the
 * dock (which carries the desktop keyboard legend itself — see
 * `AudioQuizDock`). `audioQuizType` only changes copy, never layout or
 * component choice.
 *
 * Owns which vocabulary chip is selected, same rationale as `TextQuizV2`:
 * local visual state, not business state.
 *
 * `onExit` is accepted (parity with `TextQuizV2Props`) but intentionally
 * unused here — the handoff has no in-card exit control for the audio
 * quiz (see the divergence ledger in this feature's `README.md`).
 */
export function AudioQuizV2({
  audioQuizType,
  quizCategory,
  autoplay,
  exampleNumber,
  quizLength,
  currentStep,
  displayText,
  isSpanishText,
  progressStatus,
  isPlaying,
  play,
  pause,
  onPrimary,
  onReplay,
  onPrevious,
  onNext,
  getHelpIsOpen,
  setGetHelpIsOpen,
  vocabulary,
  vocabComplete,
  vocabInfoHook,
  addPendingRemoveProps,
}: AudioQuizV2Props): JSX.Element {
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  /* Below the desktop breakpoint a selected word opens `WordPanelModal`
   * instead of the chip-anchored panel, same reasoning as `TextQuizV2`. */
  const isMobile = useMediaQuery('(max-width: 768px)');

  // A new card can never carry over the previous one's chip selection.
  useEffect(() => {
    setSelectedWordId(null);
  }, [exampleNumber]);

  function closeHelpAndClearWord(): void {
    setGetHelpIsOpen(false);
    setSelectedWordId(null);
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

  function handlePlayPause(): void {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  // Keep one stable document listener; read latest handlers from the ref so
  // we do not tear down / re-add on every render — same pattern as
  // `TextQuizV2`.
  const keyActionsRef = useRef({
    handlePlayPause,
    onPrimary,
    handlePrevious,
    handleNext,
  });
  keyActionsRef.current = {
    handlePlayPause,
    onPrimary,
    handlePrevious,
    handleNext,
  };

  // Handoff: `space` play/pause · `↑` next step · `←` `→` previous/next
  // card. Space is suppressed when a control already owns it; arrow keys
  // are suppressed only in text-entry fields where they move the caret.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const actions = keyActionsRef.current;
      if (event.key === ' ') {
        if (isFocusOnInteractiveElement()) {
          return;
        }
        event.preventDefault();
        actions.handlePlayPause();
        return;
      }
      if (event.key === 'ArrowUp') {
        if (isFocusOnInteractiveElement()) {
          return;
        }
        event.preventDefault();
        actions.onPrimary();
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (isFocusOnTextEntry()) {
          return;
        }
      }
      if (event.key === 'ArrowLeft') {
        actions.handlePrevious();
        return;
      }
      if (event.key === 'ArrowRight') {
        actions.handleNext();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isLastCard = exampleNumber >= quizLength;
  const isAnswerStep = currentStep === AudioQuizStep.Answer;

  const copy = audioQuizCopy({
    quizType: audioQuizType,
    step: currentStep,
    autoplay,
    isLastCard,
    isSpanishStep: isSpanishText,
  });

  const title = audioQuizTitle(
    quizCategory,
    audioQuizType === AudioQuizType.Speaking,
  );

  const showHelpButton = isAnswerStep && vocabComplete;

  // `orderVocabularyByAppearance` needs the Spanish sentence to place chips
  // in reading order. Help only ever opens on the Answer step, so when that
  // step's text is Spanish (speaking) this is exactly the right sentence;
  // when it's English (listening) there is no Spanish sentence to order
  // against from this component's props, so chips fall back to the hook's
  // given order — see the README's open-questions section.
  const orderedVocabulary = isSpanishText
    ? orderVocabularyByAppearance(displayText, vocabulary)
    : vocabulary;

  const selectedVocab =
    selectedWordId !== null
      ? (orderedVocabulary.find((vocab) => vocab.id === selectedWordId) ?? null)
      : null;

  const helpContent = getHelpIsOpen ? (
    <WordChips
      vocabulary={orderedVocabulary}
      selectedId={selectedWordId}
      onSelect={handleSelectWord}
      panel={
        !isMobile && selectedVocab ? (
          <WordPanel
            key={selectedVocab.id}
            vocabulary={selectedVocab}
            vocabInfoHook={vocabInfoHook}
            onClose={() => setSelectedWordId(null)}
          />
        ) : undefined
      }
    />
  ) : undefined;

  return (
    <div className={styles.root}>
      <AudioQuizProgressHeader
        eyebrow={title.eyebrow}
        subtitle={title.subtitle}
        exampleNumber={exampleNumber}
        quizLength={quizLength}
      />

      <div className={styles.cardRow}>
        <AudioQuizCard
          autoplay={autoplay}
          progressStatus={progressStatus}
          bodyKind={copy.bodyKind}
          instructionTitle={copy.instructionTitle}
          displayText={displayText}
          isAnswerStep={isAnswerStep}
          addPendingRemoveProps={addPendingRemoveProps}
          showHelpButton={showHelpButton}
          helpOpen={getHelpIsOpen}
          onToggleHelp={handleToggleHelp}
          helpContent={helpContent}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          onAdvance={onPrimary}
        />
      </div>

      <AudioQuizDock
        primaryLabel={copy.primaryLabel}
        replayLabel={copy.replayLabel}
        isFirst={exampleNumber <= 1}
        onPrimary={onPrimary}
        onReplay={onReplay}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {isMobile && selectedVocab && (
        <WordPanelModal
          key={selectedVocab.id}
          vocabulary={selectedVocab}
          vocabInfoHook={vocabInfoHook}
          onClose={() => setSelectedWordId(null)}
        />
      )}
    </div>
  );
}
