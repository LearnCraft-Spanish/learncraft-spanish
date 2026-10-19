import {
  countLabel,
  ctaLabel,
  effectiveQuizCount,
  quizNoun,
} from '@domain/functions/customQuizCopy';
import { describe, expect, it } from 'vitest';

describe('quizNoun', () => {
  it('names flashcards for a text quiz', () => {
    expect(quizNoun(false)).toBe('flashcards');
  });

  it('names audio examples for an audio quiz', () => {
    expect(quizNoun(true)).toBe('audio examples');
  });
});

describe('countLabel', () => {
  it('formats with thousands separators', () => {
    expect(countLabel(6992, false)).toBe('6,992 flashcards found');
  });

  it('switches the noun for audio', () => {
    expect(countLabel(1604, true)).toBe('1,604 audio examples found');
  });
});

describe('effectiveQuizCount', () => {
  it('caps at the quiz length', () => {
    expect(effectiveQuizCount(6992, 20)).toBe(20);
  });

  it('falls back to the available count when it is smaller', () => {
    expect(effectiveQuizCount(7, 20)).toBe(7);
  });

  it('returns the full count for "All"', () => {
    expect(effectiveQuizCount(6992, null)).toBe(6992);
  });

  it('never goes negative', () => {
    expect(effectiveQuizCount(10, -5)).toBe(0);
  });
});

describe('ctaLabel', () => {
  it('shows what will actually be drilled, not the total', () => {
    expect(ctaLabel(6992, 20, false)).toBe('Quiz 20 flashcards');
  });

  it('shows the available count when a tag narrows it below the length', () => {
    expect(ctaLabel(7, 20, false)).toBe('Quiz 7 flashcards');
  });

  it('shows the whole set for "All"', () => {
    expect(ctaLabel(6992, null, false)).toBe('Quiz 6,992 flashcards');
  });

  it('switches the noun for audio', () => {
    expect(ctaLabel(30, 10, true)).toBe('Quiz 10 audio examples');
  });
});
