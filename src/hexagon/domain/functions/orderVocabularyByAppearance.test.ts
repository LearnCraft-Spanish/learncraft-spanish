import type { Vocabulary } from '@learncraft-spanish/shared';
import { orderVocabularyByAppearance } from '@domain/functions/orderVocabularyByAppearance';
import { describe, expect, it } from 'vitest';

function vocab(id: number, word: string): Vocabulary {
  return { id, word } as unknown as Vocabulary;
}

describe('orderVocabularyByAppearance', () => {
  it('orders words by where they first appear in the text', () => {
    const result = orderVocabularyByAppearance('El gato come pescado.', [
      vocab(3, 'pescado'),
      vocab(1, 'el'),
      vocab(2, 'come'),
    ]);

    expect(result.map((v) => v.word)).toEqual(['el', 'come', 'pescado']);
  });

  it('matches case-insensitively', () => {
    const result = orderVocabularyByAppearance('Lo sé.', [
      vocab(2, 'sé'),
      vocab(1, 'lo'),
    ]);

    expect(result.map((v) => v.word)).toEqual(['lo', 'sé']);
  });

  it('matches accented words regardless of case', () => {
    const result = orderVocabularyByAppearance('Él llegó temprano.', [
      vocab(2, 'temprano'),
      vocab(1, 'él'),
    ]);

    expect(result.map((v) => v.word)).toEqual(['él', 'temprano']);
  });

  it('does not match a word inside another word', () => {
    const result = orderVocabularyByAppearance('Me lo encuentro difícil.', [
      vocab(1, 'en'),
      vocab(2, 'difícil'),
    ]);

    expect(result.map((v) => v.word)).toEqual(['difícil', 'en']);
  });

  it('matches multi-word expressions as a phrase', () => {
    const result = orderVocabularyByAppearance(
      'Voy a estudiar de vez en cuando.',
      [vocab(2, 'de vez en cuando'), vocab(1, 'estudiar')],
    );

    expect(result.map((v) => v.word)).toEqual(['estudiar', 'de vez en cuando']);
  });

  it('keeps words absent from the text in their original order at the end', () => {
    const result = orderVocabularyByAppearance('El gato duerme.', [
      vocab(4, 'ausente'),
      vocab(2, 'gato'),
      vocab(3, 'tampoco'),
      vocab(1, 'el'),
    ]);

    expect(result.map((v) => v.word)).toEqual([
      'el',
      'gato',
      'ausente',
      'tampoco',
    ]);
  });

  it('returns an empty array for empty vocabulary', () => {
    expect(orderVocabularyByAppearance('El gato duerme.', [])).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const input = [vocab(2, 'gato'), vocab(1, 'el')];
    orderVocabularyByAppearance('El gato duerme.', input);

    expect(input.map((v) => v.word)).toEqual(['gato', 'el']);
  });
});
