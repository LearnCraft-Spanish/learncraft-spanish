import type { UseQuizMyFlashcardsReturn } from '@application/useCases/useQuizMyFlashcards';
import type { JSX } from 'react';
import { SetupHeader } from '@interface/components/customQuiz/SetupHeader';
import { Badge } from '@interface/components/general/Badge/Badge';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import {
  Card,
  CardSectionHeader,
} from '@interface/components/general/Card/Card';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { MyFlashcardsQuizOptionsCard } from '@interface/components/myFlashcards/MyFlashcardsQuizOptionsCard';
import { FilterSection } from '@interface/components/studentFlashcards/FilterSection';
import styles from './MyFlashcardsQuizSetup.module.scss';

export interface MyFlashcardsQuizSetupProps {
  quiz: UseQuizMyFlashcardsReturn;
  onLeave: () => void;
}

/**
 * "Applied" mirrors Flashcard Manager's count: everything that narrows the
 * result set beyond the required scope — selected tags and the two
 * Card-options toggles. `includeUnpublished` is excluded for the same
 * reason it is there: it widens the catalog rather than narrowing it.
 */
function appliedFilterCount(
  exampleFilter: UseQuizMyFlashcardsReturn['exampleFilter'],
): number {
  const { selectedSkillTags, excludeSpanglish, audioOnly } = exampleFilter;
  return (
    selectedSkillTags.length + (excludeSpanglish ? 1 : 0) + (audioOnly ? 1 : 0)
  );
}

function appliedFilterCountLabel(count: number): string {
  return count === 1 ? '1 filter applied' : `${count} filters applied`;
}

/**
 * The setup surface for "Quiz my flashcards". A `customQuiz`-style header,
 * then the same filter-reveal chrome Flashcard Manager uses — a `Card` +
 * `CardSectionHeader` with a trailing, label-hidden `Toggle` — instead of the
 * legacy `CloseableFilterPanel`, and finally the quiz options card. There is
 * no separate tags step: toggling "Filter my flashcards" on reveals the full
 * `FilterSection` (course, lesson range, tags, card options) in place above
 * the options card, since that toggle is this page's whole
 * advanced-filtering affordance and narrows what the quiz options below draw
 * from.
 *
 * Only the options card is measure-capped on desktop (`.optionsSlot`) — it
 * is a short toggle/select stack with nothing to gain from the page's full
 * width. The filter toggle and `FilterSection` stay full width: `FilterSection`
 * is Flashcard Manager's own multi-column scope grid, and shrinking it to the
 * options card's measure would wrap columns that have room to sit side by
 * side.
 */
export function MyFlashcardsQuizSetup({
  quiz,
  onLeave,
}: MyFlashcardsQuizSetupProps): JSX.Element {
  const filterCount = appliedFilterCount(quiz.exampleFilter);

  return (
    <div className={styles.page}>
      <SetupHeader
        backLabel="Back to home"
        onBack={onLeave}
        eyebrow="Quiz my flashcards"
        title="Set up your quiz"
      />

      <div className={styles.filterControl}>
        <Card>
          <CardSectionHeader
            eyebrow="Filter my flashcards"
            action={
              <div className={styles.filterControlActions}>
                {filterCount > 0 && (
                  <Badge tone="action">
                    {appliedFilterCountLabel(filterCount)}
                  </Badge>
                )}
                <Toggle
                  id="my-flashcards-filter-owned"
                  checked={quiz.filterOwnedFlashcards}
                  onChange={quiz.setFilterOwnedFlashcards}
                  label="Filter my flashcards"
                  labelHidden
                />
              </div>
            }
          />
        </Card>
      </div>

      {quiz.filterOwnedFlashcards && (
        <FilterSection
          exampleFilter={quiz.exampleFilter}
          onResetAll={quiz.resetFilters}
        />
      )}

      <div className={styles.optionsSlot}>
        <MyFlashcardsQuizOptionsCard
          onQuizTypeChange={quiz.setQuizType}
          isAudioQuiz={quiz.isAudioQuiz}
          textQuizSetup={quiz.textQuizSetup}
          audioQuizSetup={quiz.audioQuizSetup}
          countLabel={quiz.countLabel}
          filteringIsLoading={quiz.exampleFilter.isLoading}
        />
      </div>

      <div className={styles.action}>
        <p className={styles.actionCount}>{quiz.countLabel}</p>
        <div className={styles.cta}>
          <Button disabled={quiz.quizNotReady} onClick={quiz.readyQuiz}>
            {quiz.ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
