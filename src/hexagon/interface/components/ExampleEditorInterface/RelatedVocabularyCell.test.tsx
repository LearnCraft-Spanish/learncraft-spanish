import type { Vocabulary } from '@learncraft-spanish/shared';
import { RelatedVocabularyCell } from '@interface/components/ExampleEditorInterface/RelatedVocabularyCell';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

const vocabularyList: Vocabulary[] = [
  createMockVocabulary({
    id: 1,
    word: 'hablar',
    descriptor: 'to speak',
    type: 'nonverb',
  }),
  createMockVocabulary({
    id: 2,
    word: 'comer',
    descriptor: 'to eat',
    type: 'nonverb',
  }),
  createMockVocabulary({
    id: 3,
    word: 'casa',
    descriptor: 'house',
    type: 'nonverb',
  }),
];

function renderCell({
  value,
  rowId = 'row-5',
  onVocabularyAdd = vi.fn<(vocabId: number) => void>(),
  onVocabularyRemove = vi.fn<(vocabId: number) => void>(),
}: {
  value: string;
  rowId?: string;
  onVocabularyAdd?: (vocabId: number) => void;
  onVocabularyRemove?: (vocabId: number) => void;
}) {
  render(
    <MockAllProviders>
      <RelatedVocabularyCell
        value={value}
        vocabularyList={vocabularyList}
        onVocabularyAdd={onVocabularyAdd}
        onVocabularyRemove={onVocabularyRemove}
        rowId={rowId}
      />
    </MockAllProviders>,
  );
  return { onVocabularyAdd, onVocabularyRemove };
}

describe('relatedVocabularyCell', () => {
  it('shows a tag for each vocabulary id in the cell value', () => {
    renderCell({ value: '[1,3]' });

    expect(screen.getByText('hablar')).toBeInTheDocument();
    expect(screen.getByText('casa')).toBeInTheDocument();
    expect(screen.queryByText('comer')).not.toBeInTheDocument();
  });

  it('skips ids that are not in the vocabulary list', () => {
    renderCell({ value: '[2,999]' });

    expect(screen.getByText('comer')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Remove vocabulary' }),
    ).toHaveLength(1);
  });

  it.each([
    ['an empty string', ''],
    ['only whitespace', '   '],
    ['text that is not JSON', 'not-json'],
    ['JSON that is not an array', '{"id":1}'],
  ])('shows no tags when the cell value is %s', (_label, value) => {
    renderCell({ value });

    expect(
      screen.queryByRole('button', { name: 'Remove vocabulary' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search vocabulary...'),
    ).toBeInTheDocument();
  });

  it('reports which vocabulary was removed when its remove button is clicked', () => {
    const { onVocabularyRemove, onVocabularyAdd } = renderCell({
      value: '[1,2]',
    });
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove vocabulary',
    });

    fireEvent.click(removeButtons[1]);

    expect(onVocabularyRemove).toHaveBeenCalledTimes(1);
    expect(onVocabularyRemove).toHaveBeenCalledWith(2);
    expect(onVocabularyAdd).not.toHaveBeenCalled();
  });

  it('reports which vocabulary was added when it is picked from the search', () => {
    const { onVocabularyAdd, onVocabularyRemove } = renderCell({
      value: '[1]',
    });

    fireEvent.change(screen.getByPlaceholderText('Search vocabulary...'), {
      target: { value: 'cas' },
    });
    fireEvent.click(screen.getByText('house'));

    expect(onVocabularyAdd).toHaveBeenCalledTimes(1);
    expect(onVocabularyAdd).toHaveBeenCalledWith(3);
    expect(onVocabularyRemove).not.toHaveBeenCalled();
  });

  it('opens vocabulary details only for the example whose tag was clicked', () => {
    // Two examples share the same vocabulary; each row id maps to its own
    // example id, so the details popup must belong to one example only.
    render(
      <MockAllProviders>
        <RelatedVocabularyCell
          value="[1]"
          vocabularyList={vocabularyList}
          onVocabularyAdd={vi.fn()}
          onVocabularyRemove={vi.fn()}
          rowId="row-11"
        />
        <RelatedVocabularyCell
          value="[1]"
          vocabularyList={vocabularyList}
          onVocabularyAdd={vi.fn()}
          onVocabularyRemove={vi.fn()}
          rowId="row-12"
        />
      </MockAllProviders>,
    );

    fireEvent.click(screen.getAllByText('hablar')[0]);

    expect(screen.getAllByText('Taught in:')).toHaveLength(1);
  });

  it('identifies the example the same way for a plain numeric row id and a prefixed one', () => {
    render(
      <MockAllProviders>
        <RelatedVocabularyCell
          value="[1]"
          vocabularyList={vocabularyList}
          onVocabularyAdd={vi.fn()}
          onVocabularyRemove={vi.fn()}
          rowId="21"
        />
        <RelatedVocabularyCell
          value="[1]"
          vocabularyList={vocabularyList}
          onVocabularyAdd={vi.fn()}
          onVocabularyRemove={vi.fn()}
          rowId="row-21"
        />
      </MockAllProviders>,
    );

    fireEvent.click(screen.getAllByText('hablar')[1]);

    // Both cells belong to example 21, so both show its vocabulary details.
    expect(screen.getAllByText('Taught in:')).toHaveLength(2);
  });
});
