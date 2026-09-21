import type { SkillTag } from '@learncraft-spanish/shared';
import {
  setTagQuery,
  tagCategory,
  tagDescriptor,
  tagLabel,
  TagSuggestionList,
} from '@interface/components/tagFilter/TagSuggestionList/TagSuggestionList';
import { SkillType } from '@learncraft-spanish/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const por: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-1',
  name: 'por',
  descriptor: 'for',
  vocabularyId: 1,
  subcategoryName: 'Prepositions',
  frequency: 10,
};

const blankDescriptor: SkillTag = {
  ...por,
  key: 'Vocabulary-2',
  descriptor: '   ',
};

const poner: SkillTag = {
  type: SkillType.Verb,
  key: 'Verb-7',
  name: 'poner',
  verbId: 7,
  verbTags: ['irregular', 'stem'],
};

describe('tag suggestion copy', () => {
  it('labels a vocabulary tag with its name, descriptor, and category', () => {
    expect(tagLabel(por)).toBe('por');
    expect(tagDescriptor(por)).toBe('for');
    expect(tagCategory(por)).toBe('vocabulary');
  });

  it('joins verb tags for the descriptor line', () => {
    expect(tagDescriptor(poner)).toBe('irregular - stem');
    expect(tagCategory(poner)).toBe('verb');
  });

  it('drops a descriptor that is only whitespace', () => {
    expect(tagDescriptor(blankDescriptor)).toBeNull();
  });

  it('writes a search term into the tag-search callback, and clears it with no argument', () => {
    const updateTagSearchTerm = vi.fn();

    setTagQuery(updateTagSearchTerm, 'por');
    setTagQuery(updateTagSearchTerm, '');

    expect(updateTagSearchTerm).toHaveBeenNthCalledWith(1, { value: 'por' });
    expect(updateTagSearchTerm).toHaveBeenNthCalledWith(2);
  });
});

describe('tagSuggestionList', () => {
  it('says when nothing matches', () => {
    render(<TagSuggestionList suggestions={[]} onSelect={vi.fn()} />);

    expect(screen.getByText('No tags match that.')).toBeInTheDocument();
  });

  it('selects the tag that was clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TagSuggestionList suggestions={[por]} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /por/ }));

    expect(onSelect).toHaveBeenCalledWith(por);
  });
});
