import { splitSpanishTextRuns } from '@domain/functions/splitSpanishTextRuns';
import { describe, expect, it } from 'vitest';

describe('splitSpanishTextRuns', () => {
  it('treats a sentence with no asterisks as one Spanish run', () => {
    expect(splitSpanishTextRuns('No quiero eso aquí.')).toEqual([
      { text: 'No quiero eso aquí.', english: false },
    ]);
  });

  it('marks asterisk-wrapped text as English and drops the asterisks', () => {
    expect(splitSpanishTextRuns('Son de *wood.*')).toEqual([
      { text: 'Son de ', english: false },
      { text: 'wood.', english: true },
    ]);
  });

  it('splits multiple embedded English stretches', () => {
    expect(splitSpanishTextRuns('El *wood* es *hard*')).toEqual([
      { text: 'El ', english: false },
      { text: 'wood', english: true },
      { text: ' es ', english: false },
      { text: 'hard', english: true },
    ]);
  });

  it('starts with English when the sentence opens with an asterisk', () => {
    expect(splitSpanishTextRuns('*Hola* Rebecca!')).toEqual([
      { text: 'Hola', english: true },
      { text: ' Rebecca!', english: false },
    ]);
  });

  it('returns no runs for an empty string', () => {
    expect(splitSpanishTextRuns('')).toEqual([]);
  });
});
