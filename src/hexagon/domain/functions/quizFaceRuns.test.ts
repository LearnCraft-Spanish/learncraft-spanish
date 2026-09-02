import { quizFaceRuns } from '@domain/functions/quizFaceRuns';
import { describe, expect, it } from 'vitest';

describe('quizFaceRuns', () => {
  it('leaves an all-Spanish sentence at regular weight', () => {
    expect(quizFaceRuns('Lo sabré cuando ellos lo sepan.')).toEqual([
      { text: 'Lo sabré cuando ellos lo sepan.', bold: false },
    ]);
  });

  it('bolds only the Spanish of a Spanglish sentence', () => {
    expect(quizFaceRuns('Son de *wood.*')).toEqual([
      { text: 'Son de ', bold: true },
      { text: 'wood.', bold: false },
    ]);
  });

  it('bolds every Spanish stretch between embedded English', () => {
    expect(quizFaceRuns('El *wood* es *hard*')).toEqual([
      { text: 'El ', bold: true },
      { text: 'wood', bold: false },
      { text: ' es ', bold: true },
      { text: 'hard', bold: false },
    ]);
  });

  it('handles a sentence that opens in English', () => {
    expect(quizFaceRuns('*Hola* Rebecca!')).toEqual([
      { text: 'Hola', bold: false },
      { text: ' Rebecca!', bold: true },
    ]);
  });

  it('returns no runs for an empty sentence', () => {
    expect(quizFaceRuns('')).toEqual([]);
  });
});
