import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import { useEffect, useState } from 'react';
import styles from './AudioQuizEndV2.module.scss';

export interface AudioQuizEndV2Props {
  speakingOrListening: 'speaking' | 'listening';
  isAutoplay: boolean;
  quizLength: number;
  restartQuiz: () => void;
  returnToQuizSetup: () => void;
  /** Autoplay-on only. Renders the navy "Skipped this run" card when > 0. */
  skippedCount?: number;
  /** Autoplay-off only. Renders the "Added while quizzing" card when > 0. */
  addedCount?: number;
  /** e.g. "lessons 1–111" — folded into the autoplay-on body copy. */
  contextLine?: string;
  /** Seconds the autoplay-on countdown starts from. Defaults to 20. */
  countdownSeconds?: number;
  /**
   * Controlled countdown value. When set, the internal timer never runs —
   * the display freezes at this number. Used by the visual-gauntlet
   * specimen to capture a stable "Restarting in 14s" frame.
   */
  countdown?: number;
}

const DEFAULT_COUNTDOWN_SECONDS = 20;

/**
 * Quiz-complete screen, redesigned per the handoff's two complete states.
 * Autoplay on: a countdown auto-restarts the deck; autoplay off: the
 * learner restarts manually. Distinct from the legacy `TextQuizEnd` /
 * `AudioQuizEnd` (untouched, still used by the v1 audio quiz) — this is
 * the v2 screen, gated behind `ui.student.audioquiz.v2` same as
 * `AudioQuizV2`.
 */
export function AudioQuizEndV2({
  speakingOrListening,
  isAutoplay,
  quizLength,
  restartQuiz,
  returnToQuizSetup,
  skippedCount,
  addedCount,
  contextLine,
  countdownSeconds = DEFAULT_COUNTDOWN_SECONDS,
  countdown: controlledCountdown,
}: AudioQuizEndV2Props): JSX.Element {
  const isControlled = controlledCountdown !== undefined;
  const [countdown, setCountdown] = useState(
    controlledCountdown ?? countdownSeconds,
  );

  useEffect(() => {
    if (!isAutoplay || isControlled) {
      return;
    }
    const timer = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          restartQuiz();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAutoplay, isControlled, restartQuiz]);

  const displayedCountdown = isControlled ? controlledCountdown : countdown;
  const countdownPercent =
    countdownSeconds > 0
      ? Math.round((displayedCountdown / countdownSeconds) * 100)
      : 0;

  const quizLabel =
    speakingOrListening === 'speaking' ? 'Speaking quiz' : 'Listening quiz';

  const showSkippedCard =
    isAutoplay && skippedCount !== undefined && skippedCount > 0;
  const showAddedCard =
    !isAutoplay && addedCount !== undefined && addedCount > 0;

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Eyebrow as="h2">{quizLabel}</Eyebrow>
        <p className={styles.heading}>{quizLength} cards drilled.</p>
        <p className={styles.body}>
          {isAutoplay
            ? `${contextLine ? `You worked through ${contextLine}. ` : ''}Nothing is graded in an audio quiz — the deck stays as it was.`
            : 'Autoplay was off, so nothing restarts on its own. Run the same deck again, or change the settings.'}
        </p>

        {isAutoplay && (
          <div className={styles.countdownSection}>
            <div className={styles.countdownRow}>
              <Icon name="clock" size="md" tone="action" />
              <span>Restarting in {displayedCountdown}s</span>
            </div>
            <div className={styles.countdownTrack}>
              <div
                className={styles.countdownFill}
                style={{ width: `${countdownPercent}%` }}
              />
            </div>
          </div>
        )}

        <button type="button" className={styles.primary} onClick={restartQuiz}>
          {isAutoplay ? 'Restart now' : 'Run this deck again'}
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={returnToQuizSetup}
        >
          Return to quiz setup
        </button>
      </div>

      {showSkippedCard && (
        <div className={styles.navyCard}>
          <Eyebrow as="h2" tone="onDark">
            Skipped this run
          </Eyebrow>
          <p className={styles.navyBody}>
            {skippedCount === 1
              ? '1 card was dropped because its audio would not load. It stays in your deck.'
              : `${skippedCount} cards were dropped because their audio would not load. They stay in your deck.`}
          </p>
        </div>
      )}

      {showAddedCard && (
        <div className={styles.whiteCard}>
          <Eyebrow as="h2">Added while quizzing</Eyebrow>
          <p className={styles.addedCount}>
            {addedCount} flashcard{addedCount === 1 ? '' : 's'}
          </p>
          {/* No navigation wired yet — see the README's open questions. */}
          <span className={styles.reviewRow}>
            Review them in my flashcards
            <Icon name="chevronRight" size="md" tone="muted" />
          </span>
        </div>
      )}
    </div>
  );
}
