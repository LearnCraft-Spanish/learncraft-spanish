import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  /** e.g. "lessons 1–111" — reserved for callers; not shown in legacy-matching copy. */
  contextLine?: string;
  /** Seconds the autoplay-on countdown starts from. Defaults to 20. */
  countdownSeconds?: number;
  /**
   * Controlled countdown value. When set, the internal timer never runs —
   * the display freezes at this number. Used by the visual-gauntlet
   * specimen to capture a stable countdown frame.
   */
  countdown?: number;
}

const DEFAULT_COUNTDOWN_SECONDS = 20;

/**
 * Quiz-complete screen for audio quizzes. V2 visual language (tokens, card
 * layout, countdown bar) with copy matching the legacy `AudioQuizEnd`:
 * "{Speaking|Listening} Quiz Complete!", congratulations body, autoplay
 * countdown sentence, and the same button set (Restart Quiz Now only when
 * autoplay is on; Return to Quiz Setup; Back to Home).
 */
export function AudioQuizEndV2({
  speakingOrListening,
  isAutoplay,
  restartQuiz,
  returnToQuizSetup,
  skippedCount,
  addedCount,
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

  const quizHeading =
    speakingOrListening === 'speaking'
      ? 'Speaking Quiz Complete!'
      : 'Listening Quiz Complete!';

  const showSkippedCard =
    isAutoplay && skippedCount !== undefined && skippedCount > 0;
  const showAddedCard =
    !isAutoplay && addedCount !== undefined && addedCount > 0;

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Eyebrow as="h2">
          {speakingOrListening === 'speaking'
            ? 'Speaking quiz'
            : 'Listening quiz'}
        </Eyebrow>
        <p className={styles.heading}>{quizHeading}</p>
        <p className={styles.body}>
          Congratulations! You've completed the quiz.
        </p>

        {isAutoplay && (
          <div className={styles.countdownSection}>
            <div className={styles.countdownRow}>
              <Icon name="clock" size="md" tone="action" />
              {/* Two fixed lines rather than one wrapping sentence — a
               * single line reflows between one and two lines as the
               * digit count changes (e.g. "14" → "9"), which shifts the
               * card's height and jumps the buttons below it. */}
              <span className={styles.countdownText}>
                <span>The quiz will automatically restart in</span>
                <span>
                  <strong>{displayedCountdown}</strong> seconds
                </span>
              </span>
            </div>
            <div className={styles.countdownTrack}>
              <div
                className={styles.countdownFill}
                style={{ width: `${countdownPercent}%` }}
              />
            </div>
          </div>
        )}

        {isAutoplay && (
          <button
            type="button"
            className={styles.primary}
            onClick={restartQuiz}
          >
            Restart Quiz Now
          </button>
        )}
        <button
          type="button"
          className={isAutoplay ? styles.secondary : styles.primary}
          onClick={returnToQuizSetup}
        >
          Return to Quiz Setup
        </button>
        <Link className={styles.homeLink} to="/">
          Back to Home
        </Link>
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
