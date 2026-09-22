import {
  availableQuizLengths,
  snapQuizLength,
} from '@domain/functions/quizLength';
import { describe, expect, it } from 'vitest';

describe('availableQuizLengths', () => {
  it('offers every preset when the set is large enough', () => {
    expect(availableQuizLengths(150)).toEqual([10, 20, 50, 100, 150]);
  });

  it('drops the presets that overshoot and offers the exact count', () => {
    expect(availableQuizLengths(76)).toEqual([10, 20, 50, 76]);
  });

  it('offers only the exact count below the smallest preset', () => {
    expect(availableQuizLengths(7)).toEqual([7]);
  });

  it('does not repeat a count that already is a preset', () => {
    expect(availableQuizLengths(50)).toEqual([10, 20, 50]);
  });

  it('offers nothing when nothing matches', () => {
    expect(availableQuizLengths(0)).toEqual([]);
  });
});

describe('snapQuizLength', () => {
  it('keeps a length that is still offered', () => {
    expect(snapQuizLength(20, [10, 20, 50, 100, 150])).toBe(20);
  });

  it('drops to the largest option that fits when the set grows', () => {
    expect(snapQuizLength(36, [10, 20, 50, 100, 150])).toBe(20);
  });

  it('drops to the exact count when the set shrinks under the choice', () => {
    expect(snapQuizLength(100, [10, 20, 50, 76])).toBe(76);
  });

  it('falls back to the smallest option when none fits', () => {
    expect(snapQuizLength(3, [7])).toBe(7);
  });

  it('is zero when nothing is offered', () => {
    expect(snapQuizLength(20, [])).toBe(0);
  });
});
