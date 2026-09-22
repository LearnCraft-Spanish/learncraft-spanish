import { countSrsTallies } from '@domain/functions/srsTallies';
import { describe, expect, it } from 'vitest';

describe('countSrsTallies', () => {
  it('counts nothing before anything is graded', () => {
    expect(countSrsTallies([])).toEqual({ hard: 0, easy: 0 });
  });

  it('counts easy and hard grades separately', () => {
    expect(
      countSrsTallies([
        { difficulty: 'hard' },
        { difficulty: 'easy' },
        { difficulty: 'hard' },
      ]),
    ).toEqual({ hard: 2, easy: 1 });
  });

  it('ignores viewed reviews, which are skips rather than grades', () => {
    expect(
      countSrsTallies([
        { difficulty: 'viewed' },
        { difficulty: 'easy' },
        { difficulty: 'viewed' },
      ]),
    ).toEqual({ hard: 0, easy: 1 });
  });
});
