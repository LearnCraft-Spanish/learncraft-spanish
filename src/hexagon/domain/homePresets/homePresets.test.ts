import type { HomePreset } from '@domain/homePresets/types';
import {
  DEFAULT_HOME_PRESET,
  HOME_PRESETS,
  selectHomePreset,
} from '@domain/homePresets/homePresets';
import { describe, expect, it } from 'vitest';

const LCSP_COURSE_ID = 2;

describe('selectHomePreset', () => {
  it('picks the Official Quiz preset at lesson 1', () => {
    const preset = selectHomePreset({
      courseId: LCSP_COURSE_ID,
      lessonNumber: 1,
    });
    expect(preset.label).toBe('LCSP Official Quiz');
    expect(preset.cta.path).toBe('/officialquizzes');
  });

  it('picks the Official Quiz preset at the top of its range (lesson 10)', () => {
    const preset = selectHomePreset({
      courseId: LCSP_COURSE_ID,
      lessonNumber: 10,
    });
    expect(preset.label).toBe('LCSP Official Quiz');
  });

  it('picks the Quiz My Flashcards preset at lesson 11', () => {
    const preset = selectHomePreset({
      courseId: LCSP_COURSE_ID,
      lessonNumber: 11,
    });
    expect(preset.label).toBe('LCSP Quiz My Flashcards');
    expect(preset.cta.path).toBe('/myflashcards');
  });

  it('picks the Quiz My Flashcards preset at the top of its range (lesson 24)', () => {
    const preset = selectHomePreset({
      courseId: LCSP_COURSE_ID,
      lessonNumber: 24,
    });
    expect(preset.label).toBe('LCSP Quiz My Flashcards');
  });

  it('picks the Custom Quiz preset at lesson 25', () => {
    const preset = selectHomePreset({
      courseId: LCSP_COURSE_ID,
      lessonNumber: 25,
    });
    expect(preset.label).toBe('LCSP Custom Quiz');
    expect(preset.cta.path).toBe('/customquiz');
  });

  it('matches a very high lesson against the open-ended top band', () => {
    const preset = selectHomePreset({
      courseId: LCSP_COURSE_ID,
      lessonNumber: 250,
    });
    expect(preset.label).toBe('LCSP Custom Quiz');
  });

  it('falls to the default for a course other than LearnCraft Spanish', () => {
    const preset = selectHomePreset({ courseId: 3, lessonNumber: 5 });
    expect(preset).toBe(DEFAULT_HOME_PRESET);
  });

  it('falls to the default when course or lesson is null', () => {
    expect(selectHomePreset({ courseId: null, lessonNumber: 5 })).toBe(
      DEFAULT_HOME_PRESET,
    );
    expect(
      selectHomePreset({ courseId: LCSP_COURSE_ID, lessonNumber: null }),
    ).toBe(DEFAULT_HOME_PRESET);
    expect(selectHomePreset({ courseId: null, lessonNumber: null })).toBe(
      DEFAULT_HOME_PRESET,
    );
  });
});

describe('home presets config', () => {
  it('contains no overlapping lesson ranges within a course', () => {
    const byCourse = new Map<number, HomePreset[]>();
    for (const preset of HOME_PRESETS) {
      const existing = byCourse.get(preset.courseId) ?? [];
      existing.push(preset);
      byCourse.set(preset.courseId, existing);
    }

    for (const [, presets] of byCourse) {
      const sorted = [...presets].sort(
        (a, b) => a.fromLessonNumber - b.fromLessonNumber,
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        expect(current.toLessonNumber).not.toBeNull();
        expect(current.toLessonNumber!).toBeLessThan(next.fromLessonNumber);
      }
    }
  });
});
