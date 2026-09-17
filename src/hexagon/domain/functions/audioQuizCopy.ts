import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';

/**
 * What the card body renders for the current step:
 * - `sentence` — the flashcard's Spanish or English text (target word bold).
 * - `guess` — the `Make a Guess!` prompt, no text.
 * - `audioOnly` — a single-line "… audio playing" prompt, no text.
 */
export type AudioQuizBodyKind = 'sentence' | 'guess' | 'audioOnly';

export interface AudioQuizCopyInput {
  quizType: AudioQuizType;
  step: AudioQuizStep;
  autoplay: boolean;
  /** `true` on the last card in the deck — swaps `Next card` for `Finish`. */
  isLastCard: boolean;
  /** `currentStepValue.spanish` — which language is playing/showing. */
  isSpanishStep: boolean;
}

/**
 * Where the replay dock button should send the quiz:
 * - `current` — restart this step's audio in place.
 * - `question` — return to the first step (English for speaking, Spanish
 *   for listening).
 * - `hint` — return to the Spanish-audio step (speaking answer, or
 *   listening answer).
 */
export type AudioQuizReplayTarget = 'current' | 'question' | 'hint';

export interface AudioQuizCopyResult {
  bodyKind: AudioQuizBodyKind;
  /** `null` on a `sentence` step — the sentence itself is the body. */
  instructionTitle: string | null;
  primaryLabel: string;
  replayLabel: string;
}

export interface AudioQuizReplayInput {
  quizType: AudioQuizType;
  step: AudioQuizStep;
}

/**
 * Replay always returns to the clip the student is trying to produce or
 * identify — not whatever is currently playing:
 * - Speaking question: restart English.
 * - Speaking guess/hint: back to the English question.
 * - Speaking answer: back to the Spanish hint (the answer step itself
 *   shows Spanish text, so the button becomes "Replay Spanish").
 * - Listening question/hint: restart Spanish.
 * - Listening guess: back to the Spanish question.
 * - Listening answer: back to the Spanish hint.
 */
export function audioQuizReplayTarget({
  quizType,
  step,
}: AudioQuizReplayInput): AudioQuizReplayTarget {
  if (step === AudioQuizStep.Answer) {
    return 'hint';
  }
  if (step === AudioQuizStep.Guess) {
    return 'question';
  }
  if (quizType === AudioQuizType.Speaking && step === AudioQuizStep.Hint) {
    return 'question';
  }
  return 'current';
}

export function audioQuizReplayLabel({
  quizType,
  step,
}: AudioQuizReplayInput): string {
  const isSpeaking = quizType === AudioQuizType.Speaking;
  if (isSpeaking && step !== AudioQuizStep.Answer) {
    return 'Replay English';
  }
  return 'Replay Spanish';
}

/**
 * Derives every piece of step-dependent copy for the audio quiz v2 card
 * from the handoff's step model (`Audio Quiz Redesign.dc.html`, `view()` /
 * `renderVals()`). Pure and stateless — `AudioQuizV2Screen` supplies the
 * inputs from `useAudioQuiz`'s `currentStep` / `currentStepValue.spanish`.
 * The progress header's title is not step-dependent, so it is built
 * separately by `domain/functions/quizTitle`'s `audioQuizTitle`.
 *
 * Step model (domain `AudioQuizStep`, 0-indexed in the handoff):
 * - Speaking: Question (English text+audio) → Guess → Hint (Spanish
 *   audio, no text) → Answer (Spanish text).
 * - Listening: Question (Spanish audio, no text) → Guess → Hint (Spanish
 *   text) → Answer (English text).
 */
export function audioQuizCopy({
  quizType,
  step,
  autoplay,
  isLastCard,
  isSpanishStep,
}: AudioQuizCopyInput): AudioQuizCopyResult {
  const isSpeaking = quizType === AudioQuizType.Speaking;

  const isAudioOnlyStep =
    (isSpeaking && step === AudioQuizStep.Hint) ||
    (!isSpeaking && step === AudioQuizStep.Question);

  const bodyKind: AudioQuizBodyKind =
    step === AudioQuizStep.Guess
      ? 'guess'
      : isAudioOnlyStep
        ? 'audioOnly'
        : 'sentence';

  const instructionTitle: string | null =
    bodyKind === 'guess'
      ? 'Make a Guess!'
      : bodyKind === 'audioOnly'
        ? isSpanishStep
          ? 'Spanish audio playing'
          : 'English audio playing'
        : null;

  const playOrShowSpanish = isSpeaking ? 'Play Spanish' : 'Show Spanish';
  const playAgainOrShowEnglish = isSpeaking ? 'Play again' : 'Show English';
  const nextOrFinish = isLastCard ? 'Finish' : 'Next card';

  let primaryLabel: string;
  switch (step) {
    case AudioQuizStep.Question:
      // The only step where autoplay changes the label: on, it skips
      // straight past the guess window; off, it plays/shows the same
      // thing the (skipped) guess step would have.
      primaryLabel = autoplay ? 'Skip to guess' : playOrShowSpanish;
      break;
    case AudioQuizStep.Guess:
      primaryLabel = playOrShowSpanish;
      break;
    case AudioQuizStep.Hint:
      primaryLabel = playAgainOrShowEnglish;
      break;
    case AudioQuizStep.Answer:
    default:
      primaryLabel = nextOrFinish;
      break;
  }

  const replayLabel = audioQuizReplayLabel({ quizType, step });

  return { bodyKind, instructionTitle, primaryLabel, replayLabel };
}

export interface AudioQuizTextRun {
  text: string;
  bold: boolean;
}

/** Markdown-style `**target**` marker. Only the wrapped run is bold. */
const BOLD_MARKER = /\*\*([^*]+)\*\*/g;

/**
 * Splits a flashcard sentence on `**target**` markdown markers into runs —
 * the wrapped word(s) are bold, everything else is regular. Unlike
 * `quizFaceRuns` (which bolds every Spanish stretch), the audio quiz body
 * shows one language per step, so only the explicit target-word marker
 * carries emphasis.
 */
export function audioQuizTextRuns(text: string): AudioQuizTextRun[] {
  if (text.length === 0) {
    return [];
  }

  const runs: AudioQuizTextRun[] = [];
  let lastIndex = 0;
  BOLD_MARKER.lastIndex = 0;
  let match = BOLD_MARKER.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    runs.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
    match = BOLD_MARKER.exec(text);
  }
  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex), bold: false });
  }

  return runs;
}
