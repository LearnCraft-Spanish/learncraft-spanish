import type { OfficialQuizRecord, QuizGroup } from '@learncraft-spanish/shared';
import {
  officialQuizSelectOptions,
  quizGroupSelectOptions,
} from '@domain/functions/officialQuizSetupOptions';
import { describe, expect, it } from 'vitest';

function makeQuizGroup(overrides: Partial<QuizGroup> = {}): QuizGroup {
  return {
    id: 1,
    name: 'LearnCraft Spanish',
    urlSlug: 'lcsp',
    courseId: 2,
    published: true,
    quizzes: [],
    ...overrides,
  };
}

function makeQuiz(
  overrides: Partial<OfficialQuizRecord> = {},
): OfficialQuizRecord {
  return {
    id: 10,
    quizNumber: 5,
    quizTitle: 'LCSP - Lesson 5',
    published: true,
    relatedQuizGroupId: 1,
    ...overrides,
  };
}

describe('quizGroupSelectOptions', () => {
  it('is empty with no quiz groups', () => {
    expect(quizGroupSelectOptions([])).toEqual([]);
  });

  it('maps each quiz group to a value/label option keyed by id', () => {
    const groups = [
      makeQuizGroup({ id: 1, name: 'LearnCraft Spanish' }),
      makeQuizGroup({ id: 2, name: 'Spanish in One Month' }),
    ];
    expect(quizGroupSelectOptions(groups)).toEqual([
      { value: '1', label: 'LearnCraft Spanish' },
      { value: '2', label: 'Spanish in One Month' },
    ]);
  });
});

describe('officialQuizSelectOptions', () => {
  it('is empty with no quizzes', () => {
    expect(officialQuizSelectOptions([])).toEqual([]);
  });

  it('maps each quiz to a value/label option keyed by quiz number', () => {
    const quizzes = [
      makeQuiz({ quizNumber: 5, quizTitle: 'LCSP - Lesson 5' }),
      makeQuiz({ quizNumber: 6, quizTitle: 'LCSP - Lesson 6' }),
    ];
    expect(officialQuizSelectOptions(quizzes)).toEqual([
      { value: '5', label: 'LCSP - Lesson 5' },
      { value: '6', label: 'LCSP - Lesson 6' },
    ]);
  });
});
