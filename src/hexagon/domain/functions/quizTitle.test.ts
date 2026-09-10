import {
  audioQuizTitle,
  OFFICIAL_QUIZ_EYEBROW,
  officialQuizTitle,
  textQuizTitle,
} from '@domain/functions/quizTitle';
import { describe, expect, it } from 'vitest';

describe('textQuizTitle', () => {
  it('names a non-SRS custom text quiz', () => {
    expect(textQuizTitle('custom', false)).toEqual({
      eyebrow: 'Custom Quiz',
      subtitle: 'Text Quiz',
    });
  });

  it('names a non-SRS my-flashcards text quiz', () => {
    expect(textQuizTitle('myFlashcards', false)).toEqual({
      eyebrow: 'My Flashcards Quiz',
      subtitle: 'Text Quiz',
    });
  });

  it('names an SRS my-flashcards quiz', () => {
    expect(textQuizTitle('myFlashcards', true)).toEqual({
      eyebrow: 'My Flashcards Quiz',
      subtitle: 'SRS Quiz',
    });
  });

  it('names an SRS custom quiz — SRS is not exposed for custom quizzes today, but the label still holds', () => {
    expect(textQuizTitle('custom', true)).toEqual({
      eyebrow: 'Custom Quiz',
      subtitle: 'SRS Quiz',
    });
  });
});

describe('audioQuizTitle', () => {
  it('names a speaking custom quiz', () => {
    expect(audioQuizTitle('custom', true)).toEqual({
      eyebrow: 'Custom Quiz',
      subtitle: 'Speaking Quiz',
    });
  });

  it('names a listening custom quiz', () => {
    expect(audioQuizTitle('custom', false)).toEqual({
      eyebrow: 'Custom Quiz',
      subtitle: 'Listening Quiz',
    });
  });

  it('names a speaking my-flashcards quiz', () => {
    expect(audioQuizTitle('myFlashcards', true)).toEqual({
      eyebrow: 'My Flashcards Quiz',
      subtitle: 'Speaking Quiz',
    });
  });

  it('names a listening my-flashcards quiz', () => {
    expect(audioQuizTitle('myFlashcards', false)).toEqual({
      eyebrow: 'My Flashcards Quiz',
      subtitle: 'Listening Quiz',
    });
  });
});

describe('officialQuizTitle', () => {
  it('uses the fixed "Official Quizzes" eyebrow with the API title as subtitle', () => {
    expect(officialQuizTitle('LCSP - Lesson 5')).toEqual({
      eyebrow: OFFICIAL_QUIZ_EYEBROW,
      subtitle: 'LCSP - Lesson 5',
    });
  });

  it('passes the subtitle through unchanged, even if empty', () => {
    expect(officialQuizTitle('')).toEqual({
      eyebrow: OFFICIAL_QUIZ_EYEBROW,
      subtitle: '',
    });
  });
});
