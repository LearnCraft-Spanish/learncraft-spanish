import type { Flashcard } from '@learncraft-spanish/shared';

export interface FlashcardReviewDates {
  addedOn: Flashcard['dateCreated'];
  lastReviewed: Flashcard['lastReviewed'];
  nextReview: Flashcard['nextReview'];
}

export interface FormattedFlashcardReviewDates {
  addedOn: string;
  lastReviewed: string;
  nextReview: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Review-schedule dates as the flashcard manager has always shown them:
 * MM/DD/YYYY, with a different fallback per field. A card with no creation
 * date is `unknown`, one that has never been reviewed is `Never`, and one
 * with no scheduled review is due `Today`.
 */
export function formatFlashcardReviewDates(
  dates: FlashcardReviewDates,
): FormattedFlashcardReviewDates {
  return {
    addedOn: dates.addedOn ? formatDate(dates.addedOn) : 'unknown',
    lastReviewed: dates.lastReviewed ? formatDate(dates.lastReviewed) : 'Never',
    nextReview: dates.nextReview ? formatDate(dates.nextReview) : 'Today',
  };
}
