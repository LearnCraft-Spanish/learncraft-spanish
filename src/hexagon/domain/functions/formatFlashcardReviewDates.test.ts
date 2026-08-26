import { formatFlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import { describe, expect, it } from 'vitest';

describe('formatFlashcardReviewDates', () => {
  it('formats every date as MM/DD/YYYY', () => {
    expect(
      formatFlashcardReviewDates({
        addedOn: '2024-03-07T12:00:00Z',
        lastReviewed: '2024-11-21T12:00:00Z',
        nextReview: '2025-01-09T12:00:00Z',
      }),
    ).toEqual({
      addedOn: '03/07/2024',
      lastReviewed: '11/21/2024',
      nextReview: '01/09/2025',
    });
  });

  it('falls back to unknown for a missing added date only', () => {
    expect(
      formatFlashcardReviewDates({
        addedOn: '',
        lastReviewed: '2024-11-21T12:00:00Z',
        nextReview: '2025-01-09T12:00:00Z',
      }),
    ).toEqual({
      addedOn: 'unknown',
      lastReviewed: '11/21/2024',
      nextReview: '01/09/2025',
    });
  });

  it('falls back to Never for a missing review date only', () => {
    expect(
      formatFlashcardReviewDates({
        addedOn: '2024-03-07T12:00:00Z',
        lastReviewed: '',
        nextReview: '2025-01-09T12:00:00Z',
      }),
    ).toEqual({
      addedOn: '03/07/2024',
      lastReviewed: 'Never',
      nextReview: '01/09/2025',
    });
  });

  it('falls back to Today for a missing next review only', () => {
    expect(
      formatFlashcardReviewDates({
        addedOn: '2024-03-07T12:00:00Z',
        lastReviewed: '2024-11-21T12:00:00Z',
        nextReview: '',
      }),
    ).toEqual({
      addedOn: '03/07/2024',
      lastReviewed: '11/21/2024',
      nextReview: 'Today',
    });
  });

  it('reports an unknown creation date, never reviewed, and due today', () => {
    expect(
      formatFlashcardReviewDates({
        addedOn: null,
        lastReviewed: '',
        nextReview: '',
      }),
    ).toEqual({
      addedOn: 'unknown',
      lastReviewed: 'Never',
      nextReview: 'Today',
    });
  });

  it('keeps a card that was created but never reviewed on its added date', () => {
    expect(
      formatFlashcardReviewDates({
        addedOn: '2024-03-07T12:00:00Z',
        lastReviewed: '',
        nextReview: '2024-03-08T12:00:00Z',
      }),
    ).toEqual({
      addedOn: '03/07/2024',
      lastReviewed: 'Never',
      nextReview: '03/08/2024',
    });
  });
});
