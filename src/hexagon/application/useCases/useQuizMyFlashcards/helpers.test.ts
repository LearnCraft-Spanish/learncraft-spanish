import { applyQuizLengthRoundingRules } from '@application/useCases/useQuizMyFlashcards/helpers';
import { describe, expect, it } from 'vitest';

describe('applyQuizLengthRoundingRules', () => {
  it('always returns 5 when userSelection is exactly 5', () => {
    expect(applyQuizLengthRoundingRules(5, 100, 20)).toBe(5);
  });

  it('rounds 23 down to 20 (nearest 10)', () => {
    expect(applyQuizLengthRoundingRules(23, 100, 20)).toBe(20);
  });

  it('rounds 37 up to 40 (nearest 10)', () => {
    expect(applyQuizLengthRoundingRules(37, 100, 20)).toBe(40);
  });

  it('falls back to default when rounded value equals maximum', () => {
    // rounds to 100, but 100 is not < 100 (maximum), so uses default
    expect(applyQuizLengthRoundingRules(95, 100, 20)).toBe(20);
  });

  it('falls back to default when userSelection rounds to 0', () => {
    expect(applyQuizLengthRoundingRules(0, 100, 20)).toBe(20);
  });

  it('falls back to default when rounded value exceeds maximum', () => {
    expect(applyQuizLengthRoundingRules(200, 100, 20)).toBe(20);
  });

  it('returns exact rounded value when it is less than maximum', () => {
    expect(applyQuizLengthRoundingRules(50, 100, 20)).toBe(50);
  });
});
